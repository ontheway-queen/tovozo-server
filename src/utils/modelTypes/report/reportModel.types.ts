import { JobSeekerDetails } from "../../../features/hotelier/utils/types/hotelierJobPostTypes";
import { REPORT_STATUS, REPORT_TYPE } from "../../miscellaneous/constants";
import {
	IGenderType,
	IJobPostDetailsStatus,
} from "../hotelier/jobPostModelTYpes";
import { IJobTaskActivity } from "../jobTaskActivities/jobTaskActivitiesModel.types";

export type IReportType = keyof typeof REPORT_TYPE;
export type IReportStatus = keyof typeof REPORT_STATUS;

export interface ISubmitReportPayload {
	related_id: number;
	job_post_details_id: number;
	report_type: IReportType;
	reason: string;
}

export interface IGetSingleReport {
	id: number;
	job_post_details_id: number;
	related_id: number;
	report_type: IReportType;
	reason: string;
	status: IReportStatus;
	resolution: any;
	resolved_by: any;
	resolved_at: any;
	created_at: string;
	updated_at: string;
}

export interface IGetReportsWithInfoQuery {
	user_id?: number;
	type?: IReportType;
	need_total?: boolean;
	limit?: number;
	skip?: number;
	searchQuery?: string;
}

export interface IReport {
	id: number;
	report_status: IReportStatus;
	report_type: IReportType;
	report_reason: string;
	job_post_id: number;
	title: string;
	details: string;
	requirements: string;
	prefer_gender: IGenderType;
	hourly_rate: string;
	expire_time: string;
	job_post_details_id: number;
	start_time: string;
	end_time: string;
	job_post_details_status: IJobPostDetailsStatus;
	organization_id: number;
	organization_name: string;
	organization_photo: string;
	location_id: number;
	location_name: string;
	location_address: string;
	city_name: string;
	state_name: string;
	country_name: string;
	longitude: string;
	latitude: string;
	job_seeker_details: JobSeekerDetails;
	job_task_activity: IJobTaskActivity;
}
