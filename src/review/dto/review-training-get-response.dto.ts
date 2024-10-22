import { ReviewLike } from 'src/entity/review-like.entity';

export class ReviewsTrainingGetResponseDto {
  id: number;
  year: string;
  season: string;
  cost: number;
  number_of_participants: number;
  duration: number;
  total_score: number;
  growth_score: number;
  worth_score: number;
  recommend_score: number;
  supervisor_score: number;
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
  reviewLikes: ReviewLike[];
  corpname: string;

  constructor(review) {
    this.id = review.id;
    this.year = review.year;
    this.season = review.season;
    this.cost = review.cost;
    this.number_of_participants = review.number_of_participants;
    this.duration = review.duration;
    this.total_score = review.total_score;
    this.growth_score = review.growth_score;
    this.worth_score = review.worth_score;
    this.recommend_score = review.recommend_score;
    this.supervisor_score = review.supervisor_score;
    this.highlight = review.highlight;
    this.pros = review.pros;
    this.cons = review.cons;
    this.created_date = review.created_date;
    this.likes = (review.likes || 0) + review.reviewTrainingLikes.length;
    this.blind = review.blind;
    this.user = {
      id: review.user.id,
      user_id: hideEmail(review.user.user_id),
    };
    this.reviewLikes = review.reviewTrainingLikes;
    this.corpname = review.corp.corp_name;
  }
}

const hideEmail = (email: string) => {
  if (!email) return '';
  const id = email.split('@')[0];
  const hiddenPart = id.substring(1).replace(/./g, '*');

  return id.charAt(0) + hiddenPart;
};
