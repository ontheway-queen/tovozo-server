import { PAY_LEDGER_TRX_TYPE } from "../../miscellaneous/constants";
import { TypeUser } from "../user/userModelTypes";

export interface IInitializePaymentPayload {
	application_id: number;
	job_seeker_pay: number;
	platform_fee: number;
	total_amount: number;
	status: string;
	payment_id: string;
}

export interface IGetPaymentsForHotelier {
	id: number;
	payment_no: string;
	application_id: number;
	total_amount: string;
	job_seeker_name: string;
	job_post_id: number;
	job_title: string;
	payment_type: string | null;
	status: string;
	paid_at: string | null;
	trx_id: string | null;
}

export interface IGetPaymentsForJobSeeker {
	id: number;
	payment_no: string;
	application_id: number;
	organization_name: string;
	job_post_id: number;
	job_title: string;
	job_seeker_pay: string;
	status: string;
	paid_at: string;
	trx_id: string;
}

export interface IPaymentUpdate {
	payment_type: string;
	status: string;
	trx_id: string;
	paid_at: string;
	paid_by: number;
	trx_fee: number;
}

export interface IPaymentLedgerPayload {
	payment_id: number;
	voucher_no: string;
	ledger_date: Date;
	created_at: Date;
	updated_at: Date;
	trx_id: string;
	user_id?: number | string;
	trx_type: keyof typeof PAY_LEDGER_TRX_TYPE;
	user_type: `${TypeUser}`;
	amount: number;
	details: string;
}
