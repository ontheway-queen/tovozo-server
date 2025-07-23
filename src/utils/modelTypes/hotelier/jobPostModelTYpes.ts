import {
	GENDERS,
	JOB_POST_DETAILS_STATUS,
	JOB_POST_STATUS,
	PAYMENT_STATUS,
} from "../../miscellaneous/constants";

export type IGenderType = (typeof GENDERS)[number];

export type IJobPostStatus = keyof typeof JOB_POST_STATUS;

export type IJobPostDetailsStatus = keyof typeof JOB_POST_DETAILS_STATUS;
export interface IJobPostPayload {
	organization_id: number;
	expire_time: string;
}

export interface IJobPostDetailsPayload {
	id: number;
	job_post_id: number;
	job_id: number;
	start_time: string;
	end_time: string;
	status?: IJobPostDetailsStatus;
	hourly_rate: number;
	job_seeker_pay: number;
	platform_fee: number;
}

export interface IJobPost {
	expire_time?: string;
}

export interface IJobPostDetails {
	id?: number;
	start_time?: string;
	end_time?: string;
}

export interface ICancelJobPostPayload {
	report_type: "CANCEL_JOB_POST";
}

export type IPaymentStatus = keyof typeof PAYMENT_STATUS;

export interface IGetJobPostListParams {
	organization_id?: number;
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
	from_date?: string;
	to_date?: string;
	search?: string;
}
