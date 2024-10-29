export class CommonReviewsGetResponseDto {
  id: number;
  corpname: string;
  highlight: string;
  total_score: number;
  created_date: Date;
  type: string;

  constructor(review) {
    this.id = review.id;
    this.corpname = review.corp_name;
    this.highlight = review.highlight;
    this.total_score = review.total_score;
    this.created_date = review.created_date;
    this.type = review.type;
  }
}
