import { ReviewLike } from 'src/entity/review-like.entity';

export class ReviewsGetResponseDto {
  id: number;
  hashtag: string[];
  total_score: number;
  growth_score: number;
  leadership_score: number;
  reward_score: number;
  worth_score: number;
  culture_score: number;
  worklife_score: number;
  highlight: string;
  pros: string;
  cons: string;
  created_date: Date;
  likes: number;
  blind: number;
  user: {
    id: number;
    user_id: string;
  };
  userCareer: {
    first_date: string;
    last_date: string;
    type: string;
  };
  reviewLikes: ReviewLike[];

  constructor(review) {
    this.id = review.id;
    this.hashtag = review.hashtag;
    this.total_score = review.total_score;
    this.growth_score = review.growth_score;
    this.leadership_score = review.leadership_score;
    this.reward_score = review.reward_score;
    this.worth_score = review.worth_score;
    this.culture_score = review.culture_score;
    this.worklife_score = review.worklife_score;
    this.highlight = review.highlight;
    this.pros = review.pros;
    this.cons = review.cons;
    this.created_date = review.created_date;
    this.likes = (review.likes || 0) + review.reviewLikes.length;
    this.blind = review.blind;
    this.user = {
      id: review.user.id,
      user_id: hideEmail(review.user.user_id),
    };
    this.userCareer = {
      first_date: review.userCareer.first_date,
      last_date: review.userCareer.last_date,
      type: review.userCareer.type,
    };
    this.reviewLikes = review.reviewLikes;
  }
}

const hideEmail = (email: string) => {
  if (!email) return '';
  const id = email.split('@')[0];
  const hiddenPart = id.substring(1).replace(/./g, '*');

  return id.charAt(0) + hiddenPart;
};
