import { GENDERS, PAYMENT_STATUS } from "../../miscellaneous/constants";

export type IGenderType = (typeof GENDERS)[number];

export interface IJobPostDetailsStatus {
	status:
		| "Pending"
		| "Applied"
		| "Expired"
		| "Completed"
		| "Work Finished"
		| "Cancelled";
}

export interface IJobPostPayload {
	id: number;
	organization_id: number;
	title: string;
	details?: string;
	created_time?: string;
	expire_time?: string;
	status?: IJobPostDetailsStatus;
	hourly_rate: number;
	prefer_gender?: IGenderType;
	requirements?: string;
}

export interface IJobPostDetailsPayload {
	id: number;
	job_post_id: number;
	job_id: number;
	start_time: string;
	end_time: string;
	status?: IJobPostDetailsStatus;
}

export interface IJobPost {
	title?: string;
	details?: string;
	expire_time?: string;
	hourly_rate?: number;
	prefer_gender?: IGenderType;
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

export type IPaymentStatus = keyof typeof PAYMENT_STATUS;

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
