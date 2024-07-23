import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Perspective from 'perspective-api-client';
import { CommunityTopic } from 'src/entity/community-topic.entity';
import { Repository } from 'typeorm';
import { PostCreateDto } from './dto/post-create.dto';
import { CommunityPost } from 'src/entity/community-post.entity';
import { PostUpdateDto } from './dto/post-update.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityTopic)
    private readonly communityTopicRepository: Repository<CommunityTopic>,
    @InjectRepository(CommunityPost)
    private readonly communityPostRepository: Repository<CommunityPost>,
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

  async getPostForEdit(userId: number, postId: number) {
    const post = await this.communityPostRepository.findOne({ where: { id: postId }, relations: ['topic'] });

    if (!post.id) {
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

  async getTopic(type_id: number) {
    const topics = await this.communityTopicRepository.find({
      where: { type: { id: type_id } },
    });
    return topics;
  }

  async perspective(text: string) {
    const perspective = new Perspective({ apiKey: process.env.GOOGLE_PERSPECTIVE_API_KEY });
    const response = await perspective.analyze(text);
    const score = response.attributeScores.TOXICITY.summaryScore.value;
    if (score > 0.35) {
      return false;
    } else {
      return true;
    }
  }
}
