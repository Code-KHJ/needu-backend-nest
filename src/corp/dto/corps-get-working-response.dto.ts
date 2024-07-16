export class CorpsGetWorkingResponseDto {
  constructor(
    public no: number,
    public corpname: string,
    public city: string,
    public gugun: string,
    public hashtag: any,
    public cnt: string,
    public avg: string,
  ) {}
}
