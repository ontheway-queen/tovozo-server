import { IGetJobResponse } from "./hotelierJobTypes";

export interface IJobCancellationReport {
	id: number;
	related_job_post_details: number;
	report_type: string;
	status: string;
	reporter_name: string;
	job_post_details: JobPostDetails;
	category: IGetJobResponse;
	reported_at: string;
}

export interface JobPostDetails {
	title: string;
	details: string;
	requirements: string;
	prefer_gender: string;
	hourly_rate: number;
	start_time: string;
	end_time: string;
}
