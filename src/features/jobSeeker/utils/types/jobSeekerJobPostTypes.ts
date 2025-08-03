import { IJobPostDetailsStatus } from "../../../../utils/modelTypes/hotelier/jobPostModelTYpes";

export interface IJobSeekerJob {
	id: number;
	job_post_id: number;
	status: IJobPostDetailsStatus;
	start_time: string;
	end_time: string;
	organization_id: number;
	job_title: string;
	job_category: string;
	hourly_rate: string;
	created_time: string;
	gender: string | null;
	organization_name: string;
	organization_photo: string | null;
	location_id: number;
	location_name: string;
	location_address: string;
	city_name: string;
	state_name: string;
	country_name: string;
	latitude: number;
	longitude: number;
	hotelier_id: number;
}

export interface IJobSeekerJobList {
	data: IJobSeekerJob[];
	total: number | undefined;
}
