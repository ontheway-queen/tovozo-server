export interface IGetJobResponse {
	id: number;
	title: string;
	details: string | null;
	status: boolean;
	is_deleted: boolean;
	hourly_rate: number;
	job_seeker_pay: number;
	platform_fee: number;
}
