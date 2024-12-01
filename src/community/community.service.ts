import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { execFile } from 'child_process';
import Redis from 'ioredis';
import Perspective from 'perspective-api-client';
import { CommunityCommentLike } from 'src/entity/community-comment-like.entity';
import { CommunityComment } from 'src/entity/community-comment.entity';
import { CommunityPostLike } from 'src/entity/community-post-like.entity';
import { CommunityPost } from 'src/entity/community-post.entity';
import { CommunityTopic } from 'src/entity/community-topic.entity';
import { CommunityWeeklyBest } from 'src/entity/community-weekly-best.entity';
import { CommunityCommentAccepted } from 'src/entity/community_comment_accepted.entity';
import { User } from 'src/entity/user.entity';
import { SharedService } from 'src/shared/shared.service';
import { UtilService } from 'src/util/util.service';
import { In, IsNull, Repository } from 'typeorm';
import { CommunityCommentAcceptDto } from './dto/comment-accept.dto';
import { CommunityCommentCreateDto } from './dto/comment-create.dto';
import { CommentGetResponseDto } from './dto/comment-get.dto';
import { CommentLikeDto } from './dto/comment-like.dto';
import { PostCommentGetResponseDto } from './dto/post-comment-get.dto';
import { PostCreateDto } from './dto/post-create.dto';
import { PostGetResponseDto, PostsGetDto, PostsGetResponseDto } from './dto/post-get.dto';
import { PostLikeDto } from './dto/post-like.dto';
import { PostUpdateDto } from './dto/post-update.dto';
import { WeeklyGetResponseDto } from './dto/weekly-get.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityTopic)
    private readonly communityTopicRepository: Repository<CommunityTopic>,
    @InjectRepository(CommunityPost)
    private readonly communityPostRepository: Repository<CommunityPost>,
    @InjectRepository(CommunityPostLike)
    private readonly communityPostLikeRepository: Repository<CommunityPostLike>,
    @InjectRepository(CommunityComment)
    private readonly communityCommentRepository: Repository<CommunityComment>,
    @InjectRepository(CommunityCommentLike)
    private readonly communityCommentLikeRepository: Repository<CommunityCommentLike>,
    @InjectRepository(CommunityCommentAccepted)
    private readonly communityCommentAcceptedRepository: Repository<CommunityCommentAccepted>,
    @InjectRepository(CommunityWeeklyBest)
    private readonly communityWeeklyBestRepository: Repository<CommunityWeeklyBest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly utilService: UtilService,
    private readonly sharedService: SharedService,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async createPost(userId: number, postCreateDto: PostCreateDto) {
    const { title, html, markdown, topic_id, user_id } = postCreateDto;

    const [validTitle, validContent] = await Promise.all([this.perspective(title), this.perspective(markdown)]);
    if (!validTitle) {
      throw new HttpException({ msg: 'Invalid title' }, HttpStatus.BAD_REQUEST);
    } else if (!validContent) {
      throw new HttpException({ msg: 'Invalid content' }, HttpStatus.BAD_REQUEST);
    }

    const postDto = {
      title: title,
      topic_id: topic_id,
      user_id: user_id,
      content: html,
    };
    const post = this.communityPostRepository.create(postDto);
    const savedPost = await this.communityPostRepository.save(post);

    if (!savedPost.id) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const savedPostForAlert = await this.communityPostRepository.findOne({ where: { id: savedPost.id }, relations: ['user', 'topic'] });

    const slackMsg = `
=======신규 게시글=======
글번호 : ${savedPostForAlert.id}
작성자 : ${savedPostForAlert.user.nickname}
토픽 : ${savedPostForAlert.topic.topic}
제목 : ${savedPostForAlert.title}
본문 : ${savedPostForAlert.content}
링크 : ${process.env.HOST}/community/${savedPostForAlert.topic.type.id === 1 ? 'free' : 'question'}/${savedPost.id}
`;

    this.utilService.slackWebHook('alert', slackMsg);
    this.sharedService.addPoint(userId, 4, `post${savedPost.id}`);

    return { post: savedPost };
  }

  async getPost(postId: number) {
    const post = await this.communityPostRepository.findOne({ where: { id: postId }, relations: ['user', 'topic', 'likes', 'comment_accepted', 'comments'] });

    if (!post) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (post.is_del) {
      return { msg: 'is_del' };
    }
    if (post.blind > 1) {
      return { msg: 'is_blind', blind: post.blindType.reason };
    }
    const result = new PostGetResponseDto(post);
    return result;
  }

  async getPostList(postsGetDto: PostsGetDto) {
    let { type, topic, search, order, page } = postsGetDto;
    const take = 10;
    page = page ?? 1;
    const skip = (page - 1) * take;

    const typeQuery = Number(type) > 0 ? Number(type) : 0;
    const topicQuery = Number(topic) > 0 ? Number(topic) : 0;

    const orderOptions: Record<string, string> = {
      recent: 'p.created_at',
      likes: 'like_cnt',
      comments: 'comment_cnt',
      views: 'p.view',
    };
    const orderQuery = orderOptions[order] || 'p.created_at';

    search = search ?? '';

    const queryBuilder = await this.communityPostRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .leftJoinAndSelect('p.topic', 't')
      .leftJoinAndSelect('p.comment_accepted', 'a')
      .leftJoin('p.likes', 'l')
      .leftJoin('p.comments', 'c')
      .leftJoin('p.wb', 'wb')
      .addSelect([
        'COUNT(DISTINCT l.id) AS like_cnt',
        'COUNT(DISTINCT CASE WHEN c.is_del = false THEN c.id END) AS comment_cnt',
        'CASE WHEN wb.is_del = false THEN wb.id END AS wb',
      ])
      .where('p.is_del = false');

    if (typeQuery > 0) {
      queryBuilder.andWhere('t.type.id = :typeId', { typeId: typeQuery });
    }
    if (topicQuery > 0) {
      queryBuilder.andWhere('p.topic_id = :topicId', { topicId: topicQuery });
    }
    queryBuilder.andWhere('(p.title LIKE :search OR p.content LIKE :search OR u.nickname LIKE :search)', { search: `%${search}%` });

    const postList = await queryBuilder.groupBy('p.id').orderBy(orderQuery, 'DESC').addOrderBy('p.created_at', 'DESC').offset(skip).limit(take).getRawMany();

    const totalCount = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalCount / take);

    const result: PostsGetResponseDto[] = [];
    for (const post of postList) {
      const postItem = new PostsGetResponseDto(post);
      result.push(postItem);
    }

    return { result, totalPages };
  }

  async getPostListByUser(userId: number) {
    const posts = await this.communityPostRepository.find({
      where: [
        { user_id: userId, is_del: false },
        { user_id: userId, is_del: IsNull() },
      ],
      relations: ['user', 'topic', 'likes', 'comments', 'comment_accepted', 'wb'],
      order: {
        id: 'DESC',
      },
    });

    const postList = posts.map(post => new PostGetResponseDto(post));
    return postList;
  }

  async getPostAndCommentByNickname(nickname: string) {
    const user = await this.userRepository.findOne({ where: { nickname: nickname } });
    if (!user) {
      throw new HttpException('NOT_FOUND_USER', HttpStatus.NOT_FOUND);
    }
    const posts = await this.communityPostRepository.find({
      where: [
        { user_id: user.id, is_del: false, blind: 1 },
        { user_id: user.id, is_del: IsNull(), blind: 1 },
      ],
      relations: ['likes', 'comments', 'wb', 'topic'],
    });

    const comments = await this.communityCommentRepository.find({
      where: [
        { user_id: user.id, is_del: false, blind: 1 },
        { user_id: user.id, is_del: IsNull(), blind: 1 },
      ],
      relations: ['likes', 'post', 'accepted'],
    });

    const postList = posts.map(post => new PostCommentGetResponseDto({ ...post, type: 'post' }));
    const commentList = comments.map(comment => new PostCommentGetResponseDto({ ...comment, type: 'comment' }));

    const result = [...postList, ...commentList];
    return result;
  }

  async updateView(postId: number) {
    const result = await this.communityPostRepository.update(postId, {
      view: () => 'view + 1',
      updated_at: () => 'updated_at',
    });

    // affected가 0이면 해당 ID의 포스트가 없음을 의미
    if (result.affected === 0) {
      throw new HttpException('POST_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    return;
  }

  async updatePostLike(userId: number, postLikeDto: PostLikeDto) {
    if (userId !== postLikeDto.user_id || !userId) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    const post = await this.communityPostRepository.findOne({ where: { id: postLikeDto.post_id } });
    if (!post) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const like = await this.communityPostLikeRepository.findOne({ where: { post_id: postLikeDto.post_id, user_id: postLikeDto.user_id } });
    if (postLikeDto.type === 'like') {
      if (!like) {
        const newLike = await this.communityPostLikeRepository.create({
          post_id: postLikeDto.post_id,
          user_id: postLikeDto.user_id,
          type: 1,
        });
        await this.communityPostLikeRepository.save(newLike);
        return { success: true, msg: '좋아요' };
      }
      if (like.type === 1) {
        await this.communityPostLikeRepository.remove(like);
        return { success: true, msg: '좋아요 취소' };
      }
      return { success: false, msg: '타입 오류' };
    }
    if (postLikeDto.type === 'dislike') {
      if (!like) {
        const newLike = await this.communityPostLikeRepository.create({
          post_id: postLikeDto.post_id,
          user_id: postLikeDto.user_id,
          type: -1,
        });
        await this.communityPostLikeRepository.save(newLike);
        return { success: true, msg: '싫어요' };
      }
      if (like.type === -1) {
        await this.communityPostLikeRepository.remove(like);
        return { success: true, msg: '싫어요 취소' };
      }
      return { success: false, msg: '타입 오류' };
    }
  }

  async getPostForEdit(userId: number, postId: number) {
    const post = await this.communityPostRepository.findOne({ where: { id: postId }, relations: ['topic'] });

    if (!post || post.is_del) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (userId !== post.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const result = {
      post_id: post.id,
      title: post.title,
      topic_id: post.topic_id,
      user_id: post.user_id,
      content: post.content,
      type: post.topic.type.id,
    };

    return result;
  }

  async updatePost(userId: number, postUpdateDto: PostUpdateDto) {
    const { id, title, html, markdown, topic_id, user_id } = postUpdateDto;

    const post = await this.communityPostRepository.findOneBy({ id: id });
    if (!post) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (userId !== post.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const [validTitle, validContent] = await Promise.all([this.perspective(title), this.perspective(markdown)]);
    if (!validTitle) {
      throw new HttpException({ msg: 'Invalid title' }, HttpStatus.BAD_REQUEST);
    } else if (!validContent) {
      throw new HttpException({ msg: 'Invalid content' }, HttpStatus.BAD_REQUEST);
    }

    const newType = await this.communityTopicRepository.findOne({ where: { id: topic_id } });
    const postType = await this.communityTopicRepository.findOne({ where: { id: post.topic_id } });
    if (newType.type.id !== postType.type.id) {
      throw new HttpException({ msg: 'Invalid topic' }, HttpStatus.BAD_REQUEST);
    }

    post.title = title;
    post.topic_id = topic_id;
    post.content = html;

    const savedPost = await this.communityPostRepository.save(post);

    if (!savedPost.id) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { post: savedPost };
  }

  async deletePost(userId: number, postId: number) {
    const post = await this.communityPostRepository.findOneBy({ id: postId });
    if (!post) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (userId !== post.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    post.updated_at = new Date();
    post.is_del = true;

    const savedPost = await this.communityPostRepository.save(post);
    if (!savedPost.id) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.sharedService.revokePoint(userId, 4, `post${savedPost.id}`);

    return { success: true, msg: '삭제완료' };
  }

  // 댓글
  async createComment(userId: number, commentCreateDto: CommunityCommentCreateDto) {
    const { content, user_id, post_id, parent_id } = commentCreateDto;

    if (userId !== user_id) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    const post = await this.communityPostRepository.findOne({ where: { id: post_id } });
    if (!post) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const validContent = await this.perspective(content);
    if (!validContent) {
      throw new HttpException({ msg: 'Invalid content' }, HttpStatus.BAD_REQUEST);
    }

    const comment = await this.communityCommentRepository.create(commentCreateDto);
    const savedComment = await this.communityCommentRepository.save(comment);
    if (!savedComment.id) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.sharedService.addPoint(userId, 5, `comment${savedComment.id}`);

    return { success: true, comment: savedComment };
  }

  async getComments(postId: number) {
    const comments = await this.communityCommentRepository.find({
      where: { post_id: postId, is_del: false },
      relations: ['user', 'likes'],
    });
    const result = comments.map(comment => new CommentGetResponseDto(comment));
    return result;
  }

  async updateCommentLike(userId: number, commentLikeDto: CommentLikeDto) {
    if (userId !== commentLikeDto.user_id || !userId) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    const comment = await this.communityCommentRepository.findOne({ where: { id: commentLikeDto.comment_id } });
    if (!comment) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const like = await this.communityCommentLikeRepository.findOne({ where: { comment_id: commentLikeDto.comment_id, user_id: commentLikeDto.user_id } });
    if (commentLikeDto.type === 'like') {
      if (!like) {
        const newLike = await this.communityCommentLikeRepository.create({
          comment_id: commentLikeDto.comment_id,
          user_id: commentLikeDto.user_id,
          type: 1,
        });
        await this.communityCommentLikeRepository.save(newLike);
        return { success: true, msg: '좋아요' };
      }
      if (like.type === 1) {
        await this.communityCommentLikeRepository.remove(like);
        return { success: true, msg: '좋아요 취소' };
      }
      return { success: false, msg: '타입 오류' };
    }
    if (commentLikeDto.type === 'dislike') {
      if (!like) {
        const newLike = await this.communityCommentLikeRepository.create({
          comment_id: commentLikeDto.comment_id,
          user_id: commentLikeDto.user_id,
          type: -1,
        });
        await this.communityCommentLikeRepository.save(newLike);
        return { success: true, msg: '싫어요' };
      }
      if (like.type === -1) {
        await this.communityCommentLikeRepository.remove(like);
        return { success: true, msg: '싫어요 취소' };
      }
      return { success: false, msg: '타입 오류' };
    }
  }

  async updateComment(userId: number, commentId: number, content: string) {
    const comment = await this.communityCommentRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (userId !== comment.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const validContent = await this.perspective(content);
    if (!validContent) {
      throw new HttpException({ msg: 'Invalid content' }, HttpStatus.BAD_REQUEST);
    }

    comment.content = content;
    const savedComment = await this.communityCommentRepository.save(comment);
    if (!savedComment.id) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return savedComment;
  }

  async deleteComment(userId: number, commentId: number) {
    const comment = await this.communityCommentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (userId !== comment.user_id) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const childComment = await this.communityCommentRepository.find({ where: { parent_id: commentId, is_del: false } });
    if (childComment.length > 0) {
      return { success: true, msg: '대댓글 존재' };
    }

    comment.updated_at = new Date();
    comment.is_del = true;

    const savedComment = await this.communityCommentRepository.save(comment);
    if (!savedComment.id) {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.sharedService.revokePoint(userId, 5, `comment${savedComment.id}`);
    return { success: true, msg: '삭제완료' };
  }

  async acceptComment(userId: number, acceptDto: CommunityCommentAcceptDto) {
    const { post_id, comment_id } = acceptDto;
    const post = await this.communityPostRepository.findOne({ where: { id: post_id } });
    const comment = await this.communityCommentRepository.findOne({ where: { id: comment_id }, relations: ['user'] });
    if (!post || !comment) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (post.user_id !== userId) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const Dto = {
      post: post,
      comment: comment,
    };
    const accept = await this.communityCommentAcceptedRepository.create(Dto);
    const savedAccept = await this.communityCommentAcceptedRepository.save(accept);

    this.sharedService.addPoint(comment.user.id, 6, `accepted${savedAccept.id}`);
    return { success: true, msg: '채택 완료' };
  }

  async unacceptComment(userId: number, acceptedId: number) {
    const accepted = await this.communityCommentAcceptedRepository.findOne({ where: { comment: { id: acceptedId } } });
    const comment = await this.communityCommentRepository.findOne({ where: { id: acceptedId }, relations: ['user'] });
    if (!accepted) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (accepted.post.user_id !== userId) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    this.sharedService.revokePoint(comment.user.id, 6, `accepted${accepted.id}`);
    await this.communityCommentAcceptedRepository.remove(accepted);

    return { success: true, msg: '채택 취소' };
  }

  async createWeekly(userId: number, postId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user.authority !== 100) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const post = await this.communityPostRepository.findOne({ where: { id: postId }, relations: ['user'] });
    if (!post) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const dto = {
      post: post,
      user: user,
    };
    const duplicWeekly = await this.communityWeeklyBestRepository.findOne({ where: { post: { id: postId } } });
    if (duplicWeekly && duplicWeekly.is_del === false) {
      return { msg: '중복채택' };
    }
    if (duplicWeekly && duplicWeekly.is_del === true) {
      duplicWeekly.is_del = false;
      duplicWeekly.updated_at = new Date();
      const savedWeekly = await this.communityWeeklyBestRepository.save(duplicWeekly);
      this.sharedService.addPoint(post.user.id, 7, `weekly${savedWeekly.id}`);

      return savedWeekly;
    }
    const weekly = await this.communityWeeklyBestRepository.create(dto);
    const savedWeekly = await this.communityWeeklyBestRepository.save(weekly);
    this.sharedService.addPoint(post.user.id, 7, `weekly${savedWeekly.id}`);

    return savedWeekly;
  }

  async deleteWeekly(userId: number, postId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user.authority !== 100) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const weekly = await this.communityWeeklyBestRepository.findOne({ where: { post: { id: postId } } });
    const post = await this.communityPostRepository.findOne({ where: { id: postId }, relations: ['user'] });
    if (!weekly) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    weekly.is_del = true;
    weekly.updated_at = new Date();

    const savedWeekly = await this.communityWeeklyBestRepository.save(weekly);
    this.sharedService.revokePoint(post.user.id, 7, `weekly${savedWeekly.id}`);

    return savedWeekly;
  }

  async getWeeklyList() {
    const weeklyList = await this.communityWeeklyBestRepository.find({
      where: { is_del: false },
      order: { created_at: 'DESC' },
      relations: ['post'],
    });
    const postIds = weeklyList.map(item => item.post.id);

    const postList = await this.communityPostRepository.find({ where: { id: In(postIds) }, relations: ['user', 'likes', 'comments', 'topic'] });

    const result = postList.map(post => new WeeklyGetResponseDto(post));
    return result;
  }

  // 공통
  async getTopic(type_id: number) {
    const topics = await this.communityTopicRepository.find({
      where: { type: { id: type_id } },
    });
    return topics;
  }

  async perspective(text: string) {
    try {
      const perspective = new Perspective({ apiKey: process.env.GOOGLE_PERSPECTIVE_API_KEY });
      const response = await perspective.analyze(text);
      const score = response.attributeScores.TOXICITY.summaryScore.value;
      if (score > 0.35) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error(error);
      return true;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async writeDailyProposal() {
    const today = new Date().toLocaleDateString();
    const redisKey = `${today} Proposal`;
    const rawData = await this.redis.get(redisKey);
    const proposalData = JSON.parse(rawData);

    const hasEmpty = Object.keys(proposalData)
      .filter(key => key !== 'moguem')
      .every(key => Array.isArray(proposalData[key]) && proposalData[key].length === 0);

    if (hasEmpty) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yday = yesterday.toLocaleDateString();
      const yRedisKey = `${yday} Proposal`;
      const yRawData = await this.redis.get(yRedisKey);
      const yProposalData = JSON.parse(yRawData);
      if (yProposalData) {
        if (proposalData['moguem'].length === 0 || proposalData['moguem'][0] !== yProposalData['moguem'][0]) {
          console.log('신규 데이터가 없습니다.');
          return;
        }
      }
    }

    const content = Object.keys(proposalData)
      .filter(key => key !== 'moguem')
      .map(key => {
        const values = proposalData[key];
        return values
          .map(value => {
            return `<li>[${value.writer}] ${value.title}  <a href='${value.link}' target=_blank> 상세내용</a></li>`;
          })
          .join('</br>');
      })
      .join('</br>');

    const moguemContent = Object.keys(proposalData)
      .filter(key => key === 'moguem')
      .map(key => {
        const values = proposalData[key];
        return values
          .map(value => {
            return `<li>[${value.writer}] ${value.title} (~${value.deadline})</br><a href='${value.link}' target=_blank> 상세내용</a></li>`;
          })
          .join('</br>');
      })
      .join('</br>');

    const date = new Date().toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
    const title = `[공모사업] 새로 올라온 공모사업 리스트 ${date}`;
    const body = `
<p>출근 루틴으로 조직 내부에서 모아보던 공모사업 정보입니다. 관심 있는 분들 계실 것 같아서 공유합니다.</p></br>
<ul>${content} ${moguemContent}</ul></br>
<p>이외에 공모사업을 많이하는 재단, 단체가 있다면 댓글로 알려주세요. 함께 정보를 취합해볼게요!</p>
<p>공모사업 외에 도움이 될 만한 주제가 있다면 댓글로 제안해주셔도 좋습니다! &#x1F600;</p>
`;

    const postDto = {
      title: title,
      topic_id: 1,
      user_id: 554,
      html: body,
      markdown: body,
    };
    this.createPost(1, postDto);
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async runCrawlerProposal(): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile('venv/bin/python', ['src/community/crawler/proposal.py'], (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(`Error: ${stderr}`);
          return;
        }
        resolve(stdout.trim());
      });
    });
  }
}
