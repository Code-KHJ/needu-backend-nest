import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        request => {
          return request.cookies.refreshToken;
        },
      ]),
      secretOrKey: process.env.JWT_KEY,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayloadDto) {
    const refreshToken = req.cookies['refreshToken'];

    return {
      ...payload,
      refreshToken,
    };
  }
}
