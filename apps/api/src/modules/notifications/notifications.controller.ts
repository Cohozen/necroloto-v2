import { Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentClerkId } from '../auth/current-user.decorator';
import { ClerkAuthGuard } from '../auth/guards/clerk.auth.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(ClerkAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notifications: NotificationsService) {}

    @Get()
    list(@CurrentClerkId() clerkId?: string) {
        return this.notifications.listForUser(clerkId);
    }

    @Get('unread-count')
    unreadCount(@CurrentClerkId() clerkId?: string) {
        return this.notifications.unreadCount(clerkId);
    }

    @Post('read')
    @HttpCode(204)
    markAllRead(@CurrentClerkId() clerkId?: string) {
        return this.notifications.markAllRead(clerkId);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id') id: string, @CurrentClerkId() clerkId?: string) {
        return this.notifications.remove(clerkId, id);
    }

    @Delete()
    @HttpCode(204)
    clear(@CurrentClerkId() clerkId?: string) {
        return this.notifications.clear(clerkId);
    }
}
