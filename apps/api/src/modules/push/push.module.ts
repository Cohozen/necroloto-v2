import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PushController } from './push.controller';
import { PushService } from './push.service';

@Module({
    imports: [PrismaModule],
    providers: [PushService],
    controllers: [PushController],
    exports: [PushService],
})
export class PushModule {}
