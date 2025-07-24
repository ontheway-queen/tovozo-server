import { UserStatusType } from "../../../features/public/utils/types/publicCommon.types";
import { IGenderType } from "../hotelier/jobPostModelTYpes";

export interface ICreateJobSeekerPayload {
	user_id: number;
	date_of_birth?: string;
	gender?: IGenderType;
	nationality: number;
	address?: string;
	work_permit?: boolean;
	account_status?: string;
	criminal_convictions?: boolean;
}

export interface IUpdateJobSeekerPayload
	extends Partial<ICreateJobSeekerPayload> {}

export interface IJobPreferencePayload {
	job_seeker_id: number;
	job_id: number;
}

export interface IJobLocationPayload {
	job_seeker_id: number;
	location_id: number;
}

export interface IJobShiftPayload {
	job_seeker_id: number;
	shift: string;
}

export interface IJobSeekerInfoPayload {
	job_seeker_id?: number;
	hospitality_exp?: boolean;
	languages?: string;
	hospitality_certifications?: string;
	medical_condition?: string;
	dietary_restrictions?: string;
	work_start?: string;
	certifications?: string;
	reference?: string;
	resume?: string;
	training_program_interested?: boolean;
	start_working?: string;
	hours_available?: string;
	comment?: string;
	passport_copy: string;
	visa_copy: string;
	id_copy: string;
}

export interface IJobSeekerProfile {
	user_id: number;
	email: string;
	name: string;
	phone_number: string;
	photo?: string;
	user_status: string;
	user_type: string;
	user_created_at: string;
	socket_id?: string;
	date_of_birth?: string;
	gender?: string;
	nationality?: string;
	work_permit?: string;
	account_status: string;
	criminal_convictions?: string;
	home_location_id?: number;
	home_city_id?: number;
	home_location_name?: string;
	home_address?: string;
	home_longitude?: string;
	home_latitude?: string;
	home_location_type?: string;
	home_postal_code?: string;
	home_status?: string;
	is_home_address?: boolean;
	home_created_at?: string;
	home_updated_at?: string;
	hospitality_exp?: string;
	languages?: string;
	hospitality_certifications?: string;
	medical_condition?: string;
	dietary_restrictions?: string;
	work_start?: string;
	certifications?: string;
	reference?: string;
	resume?: string;
	training_program_interested?: string;
	start_working?: string;
	hours_available?: string;
	comment?: string;
	passport_copy?: string;
	visa_copy?: string;
	id_copy?: string;
	applied_jobs?:
		| {
				id: number;
				job_post_details_id: number;
				application_status: string;
				title: string;
				details: string;
		  }[]
		| [];
}

export interface IJobPreferences {
	id: number;
	title: string;
	details: string;
}

export interface IJobLocation {
	location_id: number;
	city_id: number;
	name: string;
	address: string;
	longitude: string;
	latitude: string;
	type: string;
	postal_code: string;
	status: string;
	is_home_address: boolean;
	created_at: string;
	updated_at: string;
}

export interface IGetJobPreference {
	title: string;
	job_seeker_id: number;
	job_id: number;
}

export interface IGetJobSeeker {
	user_id: number;
	date_of_birth?: string;
	gender: IGenderType;
	nationality: number;
	work_permit?: boolean;
	account_status: UserStatusType;
	criminal_convictions?: string;
	is_2fa_on: boolean;
	location_id: number;
}
