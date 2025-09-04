import { Knex } from "knex";
import { USER_STATUS } from "../../../../utils/miscellaneous/constants";

// Db or Transaction connection types
export type TDB = Knex | Knex.Transaction;

export interface ITokenParseAdmin {
	user_id: number;
	username: string;
	name: string;
	is_main: boolean;
	photo: string | null;
	user_email: string;
	phone_number: string | null;
	status: boolean;
}

export interface ITokenParseHotelier {
	user_id: number;
	hotel_id: number;
	username: string;
	name: string;
	photo: string | null;
	email: string;
	phone_number: string | null;
	status: boolean;
}

export interface ITokenParseJobSeeker {
	user_id: number;
	username: string;
	name: string;
	photo: string | null;
	user_email: string;
	phone_number: string | null;
	status: boolean;
	gender: "Male" | "Female" | "Other";
}

export type UserStatusType = (typeof USER_STATUS)[keyof typeof USER_STATUS];
