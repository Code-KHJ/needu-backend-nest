export class CareerListGetResponseDto {
  id: number;
  corpname: string;
  start_date: string;
  end_date: string;
  career_type: string;

  constructor(career) {
    this.id = career.id;
    this.corpname = career.corp_name;
    this.start_date = career.first_date;
    this.end_date = career.last_date;
    this.career_type = career.type;
  }
}
