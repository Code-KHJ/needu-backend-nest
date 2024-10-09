import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class UtilService {
  async slackWebHook(type: string, content: string) {
    const urlList = {
      alert: process.env.SLACK_WEB_HOOK_ALERT,
      report: process.env.SLACK_WEB_HOOK_REPORT,
      request: process.env.SLACK_WEB_HOOK_REQUEST,
    };
    const url = urlList[type] || '';

    if (!url) {
      console.error('Invalid type provided:', type);
    }

    const headers = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const body = { text: content };
    try {
      const response = await axios.post(url, body, headers);
      console.log('Slack response:', response.data); // 성공 시 응답 출력
    } catch (error) {
      console.error('Error Slack WebHook:', error); // 오류 처리
    }
  }
}
