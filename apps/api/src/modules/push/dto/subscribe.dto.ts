import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

/** The `keys` object of a browser PushSubscription (ECDH + auth secret). */
export class SubscriptionKeysDto {
    @IsString()
    p256dh: string;

    @IsString()
    auth: string;
}

/**
 * A browser PushSubscription as produced by `PushSubscription.toJSON()`. The
 * optional `expirationTime` is whitelisted (browsers send it) but unused.
 */
export class SubscribeDto {
    @IsString()
    endpoint: string;

    @IsOptional()
    expirationTime?: number | null;

    @IsObject()
    @ValidateNested()
    @Type(() => SubscriptionKeysDto)
    keys: SubscriptionKeysDto;
}

/** Payload to remove a subscription (the endpoint identifies it). */
export class UnsubscribeDto {
    @IsString()
    endpoint: string;
}
