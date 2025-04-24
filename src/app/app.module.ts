import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { validate } from '../config/env.validation';
import configuration from '../config/configuration';
import { AppController } from './app.controller';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('database.uri'),
        dbName: 'physical-store',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),

    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'NestJS PhysicalStore/1.0',
        },
        baseURL: 'https://api.melhorenvio.com/v2',
        params: {
          token: config.get<string>('MELHOR_ENVIO_TOKEN'),
        },
      }),
      inject: [ConfigService],
    }),

    StoresModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
