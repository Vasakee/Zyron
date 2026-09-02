import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ContactMessageController } from './contact-message.controller';
import { ContactMessageService } from './service/contact-message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ContactMessage } from './entity/contact-message.entity';
import { S3BucketService } from '../aws/services/s3-bucket.service';
import { VerifyTokenMiddleware } from '../common/middleware';
import { SentryInterceptor } from '../sentry/sentry.interceptor';
import { ContactMessageListener } from 'src/helper/listeners/contact-message';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactMessage]),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
          return cb(null, true);
        } else {
          cb(new Error('Only images, PDFs, and documents are allowed!'), false);
        }
      },
    }),
    
  ],
  controllers: [ContactMessageController],
  providers: [
    ContactMessageService,
    S3BucketService,
    SentryInterceptor,
    ContactMessageListener
  ],
  exports: [ContactMessageService],
})
export class ContactMessageModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyTokenMiddleware)
      .exclude(
        { path: 'contacts', method: RequestMethod.GET },
        { path: 'contacts', method: RequestMethod.POST },

        { path: 'contacts/:id', method: RequestMethod.PATCH },
      )
      .forRoutes('contacts*');
  }
}
