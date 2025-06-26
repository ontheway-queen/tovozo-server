import { UserStatusType } from "../../../public/utils/types/publicCommon.types";

export interface IAdminAuthView extends IAdmin {
  username: string;
  email: string;
  password_hash: string;
  name: string;
  photo: string;
  phone_number: string;
  user_status: UserStatusType;
  user_deleted: boolean;
}

export interface IAdmin {
  user_id: number;
  role_id: number;
  is_main: boolean;
  created_by?: number;
  is_2fa_on: boolean;
}
