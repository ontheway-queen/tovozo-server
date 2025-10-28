import {
	CANCELLATION_REPORT_STATUS,
	CANCELLATION_REPORT_TYPE,
} from "../../miscellaneous/constants";

export type ICancellationReport = {
	id: number;
	reporter_id: number;
	report_type: "CANCEL_JOB_POST" | "CANCEL_APPLICATION";
	related_id: number;
	reason: string;
	status: "PENDING" | "APPROVED" | "REJECTED";
	reviewed_by: number | null;
	reviewed_at: string | null;
	reject_reason: string | null;
	before_24_hours: boolean;
	created_at: string;
	updated_at: string;
};

export interface IGetReportsQuery {
	user_id?: number;
	report_type: ICancellationReportType;
	status: ICancellationReportStatus;
	limit: number;
	skip: number;
	need_total: boolean;
	searchQuery: string;
	filter?: string;
}
export interface IGetCancellationLogAdminQuery {
	report_type?: ICancellationReportType;
	status?: ICancellationReportStatus;
	limit?: number;
	skip?: number;
	need_total?: boolean;
	name?: string;
	from_date?: string;
	to_date?: string;
}

export type ICancellationReportType = keyof typeof CANCELLATION_REPORT_TYPE;

export type ICancellationReportStatus = keyof typeof CANCELLATION_REPORT_STATUS;

export interface ICancellationReportRes {
	id: number;
	related_job_post_details: number;
	report_type: ICancellationReportType;
	status: ICancellationReportStatus;
	reporter_name: string;
	related_id: number;
	reporter_id: number;
	title: string;
	details: string;
	requirements: string;
	hourly_rate: string;
	prefer_gender: string;
	reported_at: string;
}

export interface ICancellationReportResponse {
	data: ICancellationReportRes[];
	total: number | undefined;
}
