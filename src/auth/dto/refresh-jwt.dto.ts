import { IsString } from "class-validator";

export class RefreshJwtDto {

    @IsString()
    refreshToken: string;

}