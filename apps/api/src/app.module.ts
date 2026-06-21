import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutomationModule } from './modules/automation/automation.module';
import { BetsModule } from './modules/bets/bets.module';
import { CelebritiesModule } from './modules/celebrities/celebrities.module';
import { CircleModule } from './modules/circle/circle.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { MembershipModule } from './modules/membership/membership.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SeasonsModule } from './modules/seasons/seasons.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
        PrismaModule,
        UsersModule,
        CelebritiesModule,
        BetsModule,
        CircleModule,
        MembershipModule,
        SeasonsModule,
        JobsModule,
        AutomationModule,
        NotificationsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
