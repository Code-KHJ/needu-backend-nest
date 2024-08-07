import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Perspective from 'perspective-api-client';
import { CommunityTopic } from 'src/entity/community-topic.entity';
import { Repository } from 'typeorm';
import { PostCreateDto } from './dto/post-create.dto';
import { CommunityPost } from 'src/entity/community-post.entity';
import { PostUpdateDto } from './dto/post-update.dto';
import { PostGetResponseDto } from './dto/post-get.dto';
import { PostLikeDto } from './dto/post-like.dto';
import { CommunityPostLike } from 'src/entity/community-post-like.entity';
import { CommunityCommentCreateDto } from './dto/comment-create.dto';
import { CommunityComment } from 'src/entity/community-comment.entity';
import { CommentGetResponseDto } from './dto/comment-get.dto';
import { CommentLikeDto } from './dto/comment-like.dto';
import { CommunityCommentLike } from 'src/entity/community-comment-like.entity';
import { CommunityCommentAcceptDto } from './dto/comment-accept.dto';
import { CommunityCommentAccepted } from 'src/entity/community_comment_accepted.entity';

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

    return { post: savedPost };
  }

  async getPost(postId: number) {
    const post = await this.communityPostRepository.findOne({ where: { id: postId }, relations: ['user', 'topic', 'likes', 'comment_accepted', 'comments'] });

    if (!post.id) {
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

  async updateView(postId: number) {
    const post = await this.communityPostRepository.findOne({ where: { id: postId } });

    if (!post.id) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    post.view += 1;
    await this.communityPostRepository.save(post);

    return;
  }

  async updatePostLike(userId: number, postLikeDto: PostLikeDto) {
    if (userId !== postLikeDto.user_id || !userId) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    const post = await this.communityPostRepository.findOne({ where: { id: postLikeDto.post_id } });
    if (!post.id) {
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

    if (!post.id || post.is_del) {
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
    if (!post.id) {
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
    if (!post.id) {
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

    return { success: true, msg: '삭제완료' };
  }

  // 댓글
  async createComment(userId: number, commentCreateDto: CommunityCommentCreateDto) {
    const { content, user_id, post_id, parent_id } = commentCreateDto;

    if (userId !== user_id) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    const post = await this.communityPostRepository.findOne({ where: { id: post_id } });
    if (!post.id) {
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
    if (!comment.id) {
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
    if (!comment.id) {
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
    if (!comment.id) {
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

    return { success: true, msg: '삭제완료' };
  }

  async acceptComment(userId: number, acceptDto: CommunityCommentAcceptDto) {
    const { post_id, comment_id } = acceptDto;
    const post = await this.communityPostRepository.findOne({ where: { id: post_id } });
    const comment = await this.communityCommentRepository.findOne({ where: { id: comment_id } });
    if (!post.id || !comment.id) {
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

    return { success: true, msg: '채택 완료' };
  }

  async unacceptComment(userId: number, acceptedId: number) {
    const accepted = await this.communityCommentAcceptedRepository.findOne({ where: { comment: { id: acceptedId } } });
    if (!accepted.id) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (accepted.post.user_id !== userId) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    await this.communityCommentAcceptedRepository.remove(accepted);
    return { success: true, msg: '채택 취소' };
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
}
