import {
	PAY_LEDGER_TRX_TYPE,
	PAYMENT_STATUS,
	PAYMENT_TYPE,
} from "../../miscellaneous/constants";
import { TypeUser } from "../user/userModelTypes";

export interface IInitializePaymentPayload {
	application_id: number;
	job_seeker_pay: number;
	platform_fee: number;
	total_amount: number;
	status: string;
	payment_no: string;
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
	// trx_id: string;
	user_id?: number | string;
	trx_type: (typeof PAY_LEDGER_TRX_TYPE)[keyof typeof PAY_LEDGER_TRX_TYPE];
	user_type: `${TypeUser}`;
	amount: number;
	details: string;
}

export interface IGetPaymentLedger {
	id: number;
	trx_type: string;
	amount: string;
	details: string;
	ledger_date: string;
	voucher_no: string;
}

export interface IGetAdminPayment {
	id: number;
	application_id: number;
	job_seeker_pay: string;
	platform_fee: string;
	total_amount: string;
	payment_type: (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];
	status: (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
	trx_id: string;
	created_at: string;
	paid_by: number;
	paid_at: Date;
	is_deleted: boolean;
	payment_no: string;
	trx_fee: number;
}
