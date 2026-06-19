import { Controller, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ClerkAuthGuard } from '../auth/guards/clerk.auth.guard';
import { DeathDetectionService } from './death-detection.service';

@UseGuards(ClerkAuthGuard)
@Controller('automation')
export class AutomationController {
    constructor(private readonly deathDetection: DeathDetectionService) {}

    // Admin-only: run the death check on demand (same logic as the daily cron,
    // recorded as a SyncJob for the automation history).
    @Post('detect-deaths')
    @UseGuards(AdminGuard)
    detectDeaths() {
        return this.deathDetection.scan();
    }
}
