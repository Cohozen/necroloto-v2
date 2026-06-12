import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { CelebritiesModule } from './modules/celebrities/celebrities.module';
import { BetsModule } from './modules/bets/bets.module';
import { CircleModule } from './modules/circle/circle.module';
import { MembershipModule } from './modules/membership/membership.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    CelebritiesModule,
    BetsModule,
    CircleModule,
    MembershipModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
