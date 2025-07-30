import { IJobTaskActivity } from "../../../../utils/modelTypes/jobTaskActivities/jobTaskActivitiesModel.types";
import { IGetJobResponse } from "../../../hotelier/utils/types/hotelierJobTypes";

export interface IJobSeekerJobApplication {
	job_application_id: number;
	job_application_status: string;
	applied_at: string;
	job_post_details_id: number;
	job_post_details_status: string;
	start_time: string;
	end_time: string;
	job_post_id: number;
	job_post_title: string;
	job_post_details: string;
	job_post_requirements: string;
	hourly_rate: number;
	hotelier_id: number;
	organization_id: number;
	organization_name: string;
	organization_photo: string | null;
	location_id: number;
	location_name: string;
	location_address: string;
	country_name: string;
	state_name: string;
	city_name: string;
	category: IGetJobResponse;
	job_task_activity: IJobTaskActivity;
}

export interface IAdminApplications {
	job_application_id: number;
	job_application_status: string;
	created_at: string;
	start_time: string;
	end_time: string;
	job_post_title: string;
	organization_id: number;
	organization_name: string;
	organization_photo: string;
	job_seeker_id: number;
	job_seeker_name: string;
	job_seeker_photo: any;
	assigned_by_id: number;
	assigned_by_name: string;
}
