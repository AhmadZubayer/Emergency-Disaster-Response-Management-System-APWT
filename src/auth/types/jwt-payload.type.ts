import { UserRole } from "./user-roles.type";


export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}