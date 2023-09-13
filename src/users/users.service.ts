import { Response } from 'express';
import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { UserLoginDto } from './dto/user-login.dto';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';
import { UserDuplicDto } from './dto/user-duplic.dto';
import nodemailer from 'nodemailer';
import { UserSignupDto } from './dto/user-signup.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}
  async login(userLoginDto: UserLoginDto) {
    const { id, password } = userLoginDto;
    const user = await this.usersRepository.findOneBy({
      id: id,
    });
    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      id: id,
      nickname: user.nickname,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_KEY, {
      issuer: process.env.JWT_ISSUER,
      algorithm: process.env.JWT_ALGORITHM,
      expiresIn: process.env.JWT_EXPIRESIN,
    });

    const refreshToken: string = jwt.sign({}, process.env.JWT_KEY, {
      issuer: process.env.JWT_ISSUER,
      algorithm: process.env.JWT_ALGORITHM,
      expiresIn: process.env.JWT_EXPIRESIN_REFRESH,
    });

    this.redis.set(id, refreshToken);

    const current = new Date().toISOString().slice(0, 10);
    user.login_date = new Date(current);
    await this.usersRepository.save(user);

    return { accessToken, refreshToken };
  }

  async signup(userSignupDto: UserSignupDto) {
    //아이디 중복 검사
    const userDuplicDto = new UserDuplicDto();
    userDuplicDto.item = 'id';
    userDuplicDto.value = userSignupDto.id;
    const checkDuplicId = await this.duplic(userDuplicDto);
    if (!checkDuplicId) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }

    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS));
    const hashPw = bcrypt.hashSync(userSignupDto.password, salt);
    userSignupDto.password = hashPw;

    const user = this.usersRepository.create({
      id: userSignupDto.id,
      password: userSignupDto.password,
      phonenumber: userSignupDto.phonenumber,
      nickname: userSignupDto.nickname,
      policy: userSignupDto.check_2,
      personal_info: userSignupDto.check_3,
      marketing_email: userSignupDto.check_4,
      marketing_SMS: userSignupDto.check_5,
      info_period: userSignupDto.radio1,
    });
    try {
      await this.usersRepository.save(user);
      return true;
    } catch (error) {
      return error;
    }
  }

  async duplic(userDuplicDto: UserDuplicDto) {
    const { item, value } = userDuplicDto;
    let result: boolean = false;
    const user = await this.usersRepository.createQueryBuilder().where(`${item} = '${value}'`).getOne();
    if (user === null) {
      result = true;
      return result;
    }
    return result;
  }

  async verifyEmail(email) {
    let target = email.mail;
    let authNum = Math.random().toString().substring(2, 8);
    let emailTemplate = `
      <html>
      <body>
        <div>
          <h1 style='color:black'>NeedU 회원가입을 환영합니다.</h1>
          <br>
          <p style='color:black'>회원 가입을 위한 인증번호 입니다.</p>
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
      subject: '[Needu] 회원가입을 위한 인증번호입니다.',
      html: emailTemplate,
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      }
      console.log('finish sending : ' + info.response);
      transporter.close();
    });
    return authNum;
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOneBy({
      id: id,
    });
    if (!user) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    this.usersRepository.delete({ id: id });
    return {
      result: 'success',
    };
  }
}
