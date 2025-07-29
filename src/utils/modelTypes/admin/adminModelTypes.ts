import { IGetAdminTable } from "../../../features/auth/utils/types/adminAuth.types";
import { UserStatusType } from "../../../features/public/utils/types/publicCommon.types";

export interface ICreateAdminAuditTrailPayload {
	created_by: number;
	type: "GET" | "CREATE" | "UPDATE" | "DELETE";
	endpoint: string;
	details: string;
	payload?: string;
}

export interface ICreateAdmin {
	user_id: number;
	role_id: number;
	is_main?: boolean;
	created_by?: number;
	is_2fa_on?: boolean;
}

export interface IGetAdminListFilterQuery {
	filter?: string;
	role?: number;
	limit?: number;
	skip?: number;
	status?: string;
}

export interface IAdminSearchQuery {
	email?: string;
	id?: number;
	phone_number?: string;
	username?: string;
}
export interface IGetSingleAdmin extends IGetAdminTable {
	username: string;
	name: string;
	email: string;
	phone_number: string;
	photo: string;
	password_hash: string;
	status: UserStatusType;
	role: string;
	role_id: number;
}
