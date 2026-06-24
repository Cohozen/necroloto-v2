import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { BetsModule } from '../bets/bets.module';
import { PushModule } from '../push/push.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
    imports: [PrismaModule, BetsModule, PushModule],
    providers: [NotificationsService],
    controllers: [NotificationsController],
    exports: [NotificationsService],
})
export class NotificationsModule {}
