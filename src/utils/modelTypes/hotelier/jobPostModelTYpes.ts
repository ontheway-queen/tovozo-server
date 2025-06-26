import { GENDERS } from "../../miscellaneous/constants";

export type GenderType = (typeof GENDERS)[number];

export interface IJobPostPayload {
	id: number;
	organization_id: number;
	title: string;
	details?: string;
	created_time?: string;
	expire_time?: string;
	status?: string;
	hourly_rate: number;
	prefer_gender?: GenderType;
	requirements?: string;
}

export interface IJobPostDetailsPayload {
	id: number;
	job_post_id: number;
	job_id: number;
	start_time: string;
	end_time: string;
	status?: string;
}

export interface IJobPost {
	title?: string;
	details?: string;
	expire_time?: string;
	hourly_rate?: number;
	prefer_gender?: GenderType;
	requirements?: string;
}

export interface IJobPostDetails {
	id?: number;
	start_time?: string;
	end_time?: string;
}

export interface ICancelJobPostPayload {
	report_type: "CANCEL_JOB_POST";
}

export interface IJobPostDetailsStatus {
	status:
		| "Pending"
		| "Applied"
		| "Expired"
		| "Completed"
		| "Work Finished"
		| "Cancelled";
}

export interface IGetJobPostListParams {
	user_id?: number;
	title?: string;
	category_id?: number;
	city_id?: number;
	orderBy?: string;
	orderTo?: "asc" | "desc";
	status?: string;
	limit?: number;
	skip?: number;
	need_total?: boolean;
}

export interface IJobSeekerJob {
	id: number;
	job_post_id: number;
	status: string;
	start_time: string;
	end_time: string;
	organization_id: number;
	title: string;
	job_category: string;
	hourly_rate: string;
	created_time: string;
	gender: string | null;
	organization_name: string;
	location_id: number;
	location_name: string;
	location_address: string;
	city_name: string;
	state_name: string;
	country_name: string;
}

export interface IJobSeekerJobList {
	data: IJobSeekerJob[];
	total: number | undefined;
}

export interface JobCategory {
	id: number;
	title: string;
	details: string | null;
	status: boolean;
}

export interface JobSeekerDetails {
	application_status: string | null;
	job_seeker_id: number | null;
	job_seeker_name: string | null;
	gender: string | null;
	payment_status: string | null;
	location_address: string | null;
	city_name: string | null;
	state_name: string | null;
	country_name: string | null;
	longitude: number | null;
	latitude: number | null;
}

export interface IHoiteleirJob {
	id: number;
	job_post_details_status: string;
	start_time: string;
	end_time: string;
	organization_id: number;
	title: string;
	job_category: JobCategory;
	hourly_rate: string;
	created_time: string;
	prefer_gender: string;
	organization_name: string;
	location_id: number;
	location_name: string;
	location_address: string;
	city_name: string;
	state_name: string;
	country_name: string;
	vacancy: string;
	job_seeker_details: JobSeekerDetails;
}

export interface IHoiteleirJobList {
	data: IHoiteleirJob[];
	total: number | undefined;
}
