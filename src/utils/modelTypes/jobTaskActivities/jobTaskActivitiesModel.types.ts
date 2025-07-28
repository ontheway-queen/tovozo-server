export interface IJobTaskActivityPayload {
	job_application_id: number;
	job_post_details_id: number;
}

export interface IJobTaskActivity {
	id: number;
	start_time: string | null;
	end_time: string | null;
	total_working_hours: number | null;
	start_approved_at: string | null;
	end_approved_at: string | null;
}

export interface IGetSingleTaskActivity {
	id: number;
	job_application_id: number;
	job_post_details_id: number;
	start_time: string | null;
	end_time: string | null;
	total_working_hours: number | null;
	start_approved_at: string | null;
	end_approved_at: string | null;
	application_status: string;
	job_seeker_id: number;
	job_seeker_name: string;
}
