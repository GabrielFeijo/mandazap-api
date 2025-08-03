import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as basicAuth from 'express-basic-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication) => {
  const swaggerUser = app.get(ConfigService).get('SWAGGER_USER') as string;
  const swaggerPassword = app
    .get(ConfigService)
    .get('SWAGGER_PASSWORD') as string;

  if (process.env.NODE_ENV !== 'development') {
    app.use(
      ['/docs', '/docs-json'],
      basicAuth({
        challenge: true,
        users: {
          [swaggerUser || 'admin']: swaggerPassword || 'admin',
        },
      }),
    );
  }

  const config = new DocumentBuilder()
    .setTitle('Manda Zap API')
    .setVersion('1.0.0')
    .setContact(
      'Gabriel Feijó',
      'https://github.com/GabrielFeijo',
      'feijo6622@gmail.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication operations - User registration and login')
    .addTag('users', 'User management operations - Profile management')
    .addTag('whatsapp', 'WhatsApp operations - Instance and message management')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
  });

  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: false,
      showRequestHeaders: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'Manda Zap API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #00A63E; font-size: 36px; }
      .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
    `,
  });
};
