export interface ICreateJobPayload {
	title: string;
	details: string;
	hourly_rate: number;
	job_seeker_pay: number;
	platform_fee: number;
}

export interface IJobGetParam {
	title?: string;
	filter?: string;
	orderBy?: "title";
	orderTo?: "asc" | "desc";
	status?: boolean;
	limit?: string;
	skip?: string;
}

export interface IJobUpdatePayload {
	title?: string;
	details?: string;
	status?: boolean;
}
