import { Injectable } from '@nestjs/common';
import axios from 'axios';
import nodemailer from 'nodemailer';

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

  async sendEmail(subject: string, target: string, content: string) {
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
      from: `"니쥬(NeedU)" <needu.sw@gmail.com>`,
      to: target,
      subject: subject,
      html: content,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('finish sending : ' + info.response);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
