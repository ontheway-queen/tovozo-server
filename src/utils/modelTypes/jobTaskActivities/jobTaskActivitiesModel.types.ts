export interface IJobTaskActivityPayload {
	job_application_id: number;
	job_post_details_id: number;
}

export interface IJobTaskActivity {
	id: number;
	start_time: string | null;
	end_time: string | null;
	approved_at: string | null;
}
