import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import * as nunjucks from 'nunjucks';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const port = process.env.PORT || 8000;

  app.use(cookieParser());

  nunjucks.configure('public', {
    autoescape: true,
    watch: true,
    express: app,
  });

  const config = new DocumentBuilder().setTitle('Needu').setDescription('Needu API description').setVersion('1.0').build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.enableCors({
    origin: ['http://localhost:8000', 'http://localhost:5173', 'https://needu.site', 'http://needu.site', 'http://www.needu.site', 'https://www.needu.site'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(port);
  console.log(`Server started on port ${port}`);
}
bootstrap();
