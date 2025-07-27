import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

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

  await app.listen(3333);

  setInterval(
    () => {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(`🧠 Memória usada: ${Math.round(used * 100) / 100} MB`);

      if (global.gc) {
        global.gc();
        console.log('🧹 GC forçado');
      }
    },
    2 * 60 * 1000,
  ); // 2 minute
}
void bootstrap();
