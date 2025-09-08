export interface IJobTaskListPayload {
	job_task_activity_id: number;
	message: string;
}

export interface IGetJobTaskList {
	id: number;
	message: string;
	is_completed: boolean;
	completed_at: string;
	created_at: string;
	job_seeker_id: number;
	job_seeker_name: string;
	hotelier_id: number;
	job_task_activity_id: number;
}
export interface IJobTaskListQuery {
	id?: number;
	job_task_activity_id?: number;
}

export interface IUpdateJobTaskListPayload {
	is_completed?: boolean;
	message?: string;
	completed_at?: string | null;
}
