import { JOB_APPLICATION_STATUS } from "../../miscellaneous/constants";

export type IJobApplicationStatus = keyof typeof JOB_APPLICATION_STATUS;

export interface ICreateJobApplicationPayload {
	job_post_details_id: number;
	job_seeker_id: number;
	job_post_id: number;
}

export interface IGetMyJobApplicationsParams {
	user_id: number;
	orderBy?: string;
	orderTo?: "asc" | "desc";
	status?: string;
	limit?: number;
	skip?: number;
	need_total?: boolean;
}
