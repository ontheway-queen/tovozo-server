import {
	IGenderType,
	IJobPostDetailsStatus,
	IPaymentStatus,
} from "../../../../utils/modelTypes/hotelier/jobPostModelTYpes";
import { IJobTaskActivity } from "../../../../utils/modelTypes/jobTaskActivities/jobTaskActivitiesModel.types";
import { IGetJobResponse } from "./hotelierJobTypes";

export interface JobSeekerDetails {
	application_status: string | null;
	job_seeker_id: number | null;
	job_seeker_name: string | null;
	gender: IGenderType | null;
	payment_status: IPaymentStatus | null;
	location_address: string | null;
	city_name: string | null;
	state_name: string | null;
	country_name: string | null;
	longitude: number | null;
	latitude: number | null;
}

export interface IHoiteleirJob {
	id: number;
	job_post_id: number;
	job_post_details_status: IJobPostDetailsStatus;
	start_time: string;
	end_time: string;
	organization_id: number;
	title: string;
	job_category: IGetJobResponse;
	hourly_rate: string;
	job_seeker_pay: string;
	platform_fee: string;
	created_time: string;
	prefer_gender: IGenderType;
	organization_name: string;
	location_id: number;
	location_name: string;
	location_address: string;
	city_name: string;
	state_name: string;
	country_name: string;
	vacancy: string;
	job_seeker_details: JobSeekerDetails;
	job_task_activities: IJobTaskActivity;
	hotelier_id?: number;
}

export interface IHoiteleirJobList {
	data: IHoiteleirJob[];
	total: number | undefined;
}
