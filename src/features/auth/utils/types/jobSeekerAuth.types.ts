import { GenderType } from "../../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import { TypeUser } from "../../../../utils/modelTypes/user/userModelTypes";
import { UserStatusType } from "../../../public/utils/types/publicCommon.types";

export interface IJobSeekerAuthView {
  user_id: number;
  email: string;
  password_hash: string;
  name: string;
  phone_number: string;
  photo?: string;
  user_status: boolean;
  user_deleted: boolean;
  user_type: TypeUser.JOB_SEEKER;
  date_of_birth?: string;
  nationality?: string;
  gender?: GenderType;
  work_permit?: string;
  account_status: UserStatusType;
  criminal_convictions?: string;
  is_2fa_on: boolean;
  location_id?: number;
  city_id?: number;
  location_name?: string;
  location_address?: string;
  longitude?: string;
  latitude?: string;
  location_type?: string;
  postal_code?: string;
  location_status?: string;
  is_home_address?: boolean;
  location_created_at?: string;
  location_updated_at?: string;
}
