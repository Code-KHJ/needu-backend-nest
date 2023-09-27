export class CorpsGetResponseDto {
  constructor(
    public no: number,
    public corpname: string,
    public city: string,
    public gugun: string,
    public score: number,
    public hashtag1: string,
    public hashtag2: string,
    public hashtag3: string,
    public hashtag4: string,
    public review_cnt: number,
  ) {}
}
