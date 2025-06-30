import { IJobTaskActivity } from "../../../../utils/modelTypes/jobTaskActivities/jobTaskActivitiesModel.types";
import { IGetJobResponse } from "../../../hotelier/utils/types/hotelierJobTypes";

export interface IJobSeekerJobApplication {
	job_application_id: number;
	job_application_status: string;
	payment_status: string;
	applied_at: string;
	job_post_details_id: number;
	job_post_details_status: string;
	start_time: string;
	end_time: string;
	job_post_id: number;
	job_post_title: string;
	job_post_details: string;
	job_post_requirements: string;
	organization_id: number;
	organization_name: string;
	location_id: number;
	location_name: string;
	location_address: string;
	country_name: string;
	state_name: string;
	city_name: string;
	category: IGetJobResponse;
	job_task_activity: IJobTaskActivity;
}
