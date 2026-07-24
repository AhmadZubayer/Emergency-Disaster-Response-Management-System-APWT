import { IsEmail, IsNotEmpty} from "class-validator";

export class signInUserDto {
   @IsEmail()
   @IsNotEmpty()
   email : string;
   @IsNotEmpty()
   password : string;
}