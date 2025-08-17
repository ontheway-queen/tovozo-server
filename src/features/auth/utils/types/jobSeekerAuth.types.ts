import { IGenderType } from "../../../../utils/modelTypes/hotelier/jobPostModelTYpes";
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
	gender?: IGenderType;
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

export interface IJobSeekerUserBody {
	name: string;
	email: string;
	password: string;
	gender: IGenderType;
	phone_number: string;
	photo: string;
}

export interface IJobSeekerLocationInfo {
	city_id?: number;
	name?: string;
	address?: string;
	longitude?: number;
	latitude?: number;
	postal_code?: string;
}

export interface IJobSeekerInfoBody {
	visa_copy: string;
	id_copy: string;
	passport_copy: string;
	date_of_birth?: string;
	work_permit?: string;
	criminal_convictions?: string;
	address?: string;
	resume?: string;
}

export interface IJobSeekerNationalityBody {
	nationality: number;
	account_status?: UserStatusType;
}
