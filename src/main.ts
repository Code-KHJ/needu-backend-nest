import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import * as nunjucks from 'nunjucks';
import { AtGuard } from './common/guards';

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
    origin: ['http://localhost:8000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(port);
  console.log(`Server started on port ${port}`);
}
bootstrap();
