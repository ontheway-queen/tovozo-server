export interface IJobTaskActivity {
	id: number;
	job_application_id: number;
	job_seeker_id: number;
	job_seeker_name: string;
	job_task_activity: string;
	created_at: string;
	approved_at: string | null;
}

export interface IJobTaskList {
	id: number;
	job_task_activity_id: number;
	message: string;
	is_completed: boolean;
	completed_at: string | null;
	created_at: string;
}

export interface IUpdateJobTaskListPayload {
	is_completed?: boolean;
	message?: string;
	completed_at?: string | null;
}
