import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import bcrypt, { hash } from 'bcrypt';
import nodemailer from 'nodemailer';
import { UserCareer } from 'src/entity/user-career.entity';
import { UtilService } from 'src/util/util.service';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { CareerCreateDto } from './dto/career-create.dto';
import { UserCreateResponseDto } from './dto/user-create-response.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { UserDeleteeDto } from './dto/user-delete.dto';
import { UserDuplicDto } from './dto/user-duplic.dto';
import { UserInfoGetDto } from './dto/userinfo-get.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCareer)
    private readonly careerRepository: Repository<UserCareer>,

    private readonly utilService: UtilService,
  ) {}

  async create(userCreateDto: UserCreateDto): Promise<UserCreateResponseDto> {
    //아이디 중복 검사
    const userDuplicDto = new UserDuplicDto();
    userDuplicDto.item = 'id';
    userDuplicDto.value = userCreateDto.user_id;
    const checkDuplicId = await this.duplic(userDuplicDto);
    if (!checkDuplicId) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }

    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS));
    const hashPw = bcrypt.hashSync(userCreateDto.password, salt);
    userCreateDto.password = hashPw;

    const user = this.userRepository.create({
      user_id: userCreateDto.user_id,
      password: userCreateDto.password,
      phonenumber: userCreateDto.phonenumber,
      nickname: userCreateDto.nickname,
      policy: userCreateDto.policy,
      personal_info: userCreateDto.personal_info,
      marketing_email: userCreateDto.marketing_email,
      marketing_SMS: userCreateDto.marketing_SMS,
    });

    const slackMsg = `
=======회원가입=======
아이디 : ${user.user_id}
닉네임 : ${user.nickname}
회원가입하셨습니다.
`;
    try {
      await this.userRepository.save(user);
      this.utilService.slackWebHook('alert', slackMsg);
      return new UserCreateResponseDto(user);
    } catch (error) {
      console.error(error);
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }

  async duplic(userDuplicDto: UserDuplicDto) {
    const { item, value } = userDuplicDto;
    let result: boolean = false;
    const user = await this.userRepository.createQueryBuilder().where(`${item} = '${value}'`).getOne();
    if (user === null) {
      result = true;
      return result;
    }
    return result;
  }

  async verifyEmail(email) {
    let target = email.email;
    let authNum = Math.random().toString().substring(2, 8);
    let emailTemplate = `
      <html>
      <body>
        <div>
          <h1 style='color:black'>안녕하세요 NeedU입니다.</h1>
          <br>
          <p style='color:black'>본인 확인을 위한 인증번호 입니다.</p>
          <p style='color:black'>아래의 인증 번호를 입력하여 인증을 완료해주세요.</p>
          <h2>${authNum}</h2>
        </div>
      </body>
      </html>
    `;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    let mailOptions = {
      from: `needu`,
      to: target,
      subject: '[Needu] 본인 확인을 위한 인증번호입니다.',
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
        return err;
      }
      console.log('finish sending : ' + info.response);
      transporter.close();
    });
    return { status: 'completed', authNum: authNum };
  }

  async verifyPhone(phone) {
    let target = phone.phone;
    let authNum = Math.random().toString().substring(2, 8);
    let content = `[Needu] 인증번호는 ${authNum}입니다.`;
    let payload = {
      tas_id: process.env.TASON_ID,
      send_type: 'LM',
      auth_key: process.env.TASON_API_KEY,
      data: [
        {
          user_name: 'user',
          user_email: target,
          map_content: content,
          sender: process.env.TASON_SENDER,
          sender_name: 'Needu',
          subject: '니쥬 인증번호',
        },
      ],
    };
    let url = 'https://api.tason.com/tas-api/send';
    let response = await axios.post(url, payload);

    console.log(response.data['MEM CNT']);
    if (response.data['MEM CNT'] !== 1) {
      console.log(response.data);
      return { status: 'error' };
    }

    return { status: 'completed', authNum: authNum };
  }

  async remove(userDeleteDto: UserDeleteeDto) {
    const { user_id, password } = userDeleteDto;
    let user = await this.userRepository.findOneBy({
      user_id: user_id,
    });
    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    try {
      this.userRepository.delete({ user_id: user_id });
      return true;
    } catch (error) {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }

  async findUser(data) {
    const { field, value } = data;
    console.log(data);
    const users = await this.userRepository.find({ where: { [field]: value } });
    if (!users) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    console.log(users);
    const result = users.map(user => ({
      user_id: user.user_id,
      nickname: user.nickname,
      created_date: user.created_date,
    }));
    console.log(result);
    return result;
  }

  async updateInfo(userId, userData) {
    const { nickname, phonenumber } = userData;
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    user.nickname = nickname;
    user.phonenumber = phonenumber;
    user.modified_date = new Date();

    const savedUser = await this.userRepository.save(user);

    const userInfo = new UserInfoGetDto(savedUser);
    return userInfo;
  }

  async updatePassword(userId, userDate) {
    const { password, newPassword } = userDate;
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS));

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }

    const newHashPassword = bcrypt.hashSync(newPassword, salt);

    user.password = newHashPassword;
    user.modified_date = new Date();

    const savedUser = await this.userRepository.save(user);

    const userInfo = new UserInfoGetDto(savedUser);
    return userInfo;
  }

  async updatePw(data) {
    const { id, field, value } = data;
    let user = await this.userRepository.findOneBy({
      user_id: id,
    });
    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS));
    const hashPw = bcrypt.hashSync(value, salt);

    user.password = hashPw;
    user.modified_date = new Date();
    try {
      await this.userRepository.save(user);
      return true;
    } catch (error) {
      console.log(error);
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }

  async createCareer(createCareerDto: CareerCreateDto) {
    if (!createCareerDto.user_id || !createCareerDto.corp_name) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    return this.careerRepository.create(createCareerDto);
  }

  async getCareer(review_no: number) {
    return this.careerRepository.findOne({ where: { review_no: review_no } });
  }

  async uploadProfile(userId: number, file: Express.MulterS3.File) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (user && file.location) {
      user.profile_image = file.location;
      user.modified_date = new Date();
      await this.userRepository.save(user);
    }

    return { imageUrl: user.profile_image };
  }

  async getUserInfo(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const userInfo = new UserInfoGetDto(user);
    return userInfo;
  }
}
