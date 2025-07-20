export interface ICreatePaymentPayload {
	application_id: number;
	job_seeker_pay: number;
	platform_fee: number;
	total_amount: number;
	status: string;
	payment_id: string;
}

export interface IGetPaymentsForHotelier {
	id: number;
	payment_id: string;
	application_id: number;
	job_seeker_name: string;
	job_post_id: number;
	job_title: string;
	payment_type: string | null;
	status: string;
	paid_at: string | null;
	trx_id: string | null;
}
