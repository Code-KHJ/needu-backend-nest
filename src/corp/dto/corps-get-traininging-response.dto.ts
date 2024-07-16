export class CorpsGetTrainingResponseDto {
  constructor(
    public no: number,
    public corpname: string,
    public city: string,
    public gugun: string,
    public hashtag: any,
    public number_of_participants: string,
    public cost: string,
    public duration: string,
    public cnt: string,
    public avg: string,
  ) {}
}
