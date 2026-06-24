import { Body, Controller, Delete, Get, Headers, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CurrentClerkId } from '../auth/current-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ClerkAuthGuard } from '../auth/guards/clerk.auth.guard';
import { SubscribeDto, UnsubscribeDto } from './dto/subscribe.dto';
import { PushService } from './push.service';

@UseGuards(ClerkAuthGuard)
@Controller('push')
export class PushController {
    constructor(private readonly push: PushService) {}

    /** The VAPID public key the browser uses to subscribe. */
    @Get('vapid-public-key')
    vapidPublicKey() {
        return this.push.getPublicKey();
    }

    @Post('subscribe')
    @HttpCode(204)
    subscribe(
        @Body() dto: SubscribeDto,
        @Headers('user-agent') userAgent?: string,
        @CurrentClerkId() clerkId?: string,
    ) {
        return this.push.subscribe(clerkId, dto, userAgent);
    }

    @Delete('subscribe')
    @HttpCode(204)
    unsubscribe(@Body() dto: UnsubscribeDto, @CurrentClerkId() clerkId?: string) {
        return this.push.unsubscribe(clerkId, dto.endpoint);
    }

    /** Sends a test push to the caller's own devices (global admins only). */
    @Post('test')
    @UseGuards(AdminGuard)
    sendTest(@CurrentClerkId() clerkId?: string) {
        return this.push.sendTest(clerkId);
    }
}
