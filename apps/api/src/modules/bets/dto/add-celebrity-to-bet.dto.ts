import { IsString } from 'class-validator';

export class AddCelebrityToBetDto {
    @IsString()
    celebrityId: string;
}
