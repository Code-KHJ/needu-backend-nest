import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import axios from 'axios';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: '',
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: any) {
    try {
      const { data } = await axios.get('https://kapi.kakao.com/v2/user/service_terms', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { _json } = profile;

      const user = {
        id: _json.kakao_account.email,
        nickname: _json.kakao_account.profile.nickname,
        phonenumber: _json.kakao_account.phone_number,
        marketing: data.service_terms.find(term => term.tag === 'marketing_consent')?.agreed,
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
