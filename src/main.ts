import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

process.on('uncaughtException', (err) => {
  console.error('❌', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌', reason, promise);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:5173').split(
      ',',
    ),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(process.env.PORT || 3333);
}
void bootstrap();
