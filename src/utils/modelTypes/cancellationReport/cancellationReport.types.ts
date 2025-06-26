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
	report_type: "CANCEL_APPLICATION" | "CANCEL_JOB_POST";
	status: "PENDING" | "APPROVED" | "REJECTED";
	limit: number;
	skip: number;
	need_total: boolean;
	search_text: string;
}
