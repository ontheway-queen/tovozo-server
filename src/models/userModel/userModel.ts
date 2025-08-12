import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
	ICheckUserData,
	ICheckUserParams,
	ICreateUserPayload,
} from "../../utils/modelTypes/user/userModelTypes";

export default class UserModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async createUser(payload: ICreateUserPayload) {
		return await this.db(this.TABLES.user)
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	public async createUserMaintenanceDesignation(payload: {
		designation: string;
		user_id: number;
	}) {
		return await this.db(this.TABLES.maintenance_designation)
			.withSchema(this.HOTELIER)
			.insert(payload);
	}
	//update
	public async updateProfile(
		payload: Partial<ICreateUserPayload>,
		where: { id?: number }
	) {
		return await this.db("user")
			.withSchema(this.DBO_SCHEMA)
			.update(payload)
			.where((qb) => {
				if (where.id) {
					qb.where("id", where.id);
				}
			});
	}

	public async checkUser(
		params: ICheckUserParams
	): Promise<ICheckUserData[]> {
		const { email, id, username, type, phone_number } = params;

		return await this.db(this.TABLES.user)
			.withSchema(this.DBO_SCHEMA)
			.select("*")
			.where("is_deleted", false)
			.modify((qb) => {
				if (id) qb.where("id", id);
				if (type) qb.where("type", type);
				if (email) qb.orWhere("email", email);
				if (username) qb.orWhere("username", username);
				if (phone_number) qb.orWhere("phone_number", phone_number);
			});
	}

	public async getSingleCommonAuthUser<T>({
		schema_name,
		table_name,
		user_id,
		user_name,
		email,
		phone_number,
	}: {
		schema_name: "dbo" | "hotelier" | "jobseeker" | "admin";
		table_name: string;
		user_id?: number;
		user_name?: string;
		email?: string;
		phone_number?: string;
	}): Promise<T> {
		return this.db(table_name)
			.withSchema(schema_name)
			.select("*")
			.modify((qb) => {
				if (user_id) {
					qb.where("user_id", user_id);
				}
				if (user_name) qb.where("username", user_name);
				if (email) qb.where("email", email);
				if (phone_number) qb.where("phone_number", phone_number);
			})
			.first();
	}

	//get last  user Id
	public async getLastUserID(): Promise<number> {
		const result = await this.db(this.TABLES.user)
			.withSchema(this.DBO_SCHEMA)
			.max<{ max: number }>("id as max")
			.first();

		return result?.max ?? 0;
	}

	public async deleteUser(id: number) {
		return await this.db(this.TABLES.user)
			.withSchema(this.DBO_SCHEMA)
			.update({ is_deleted: true })
			.where({ id });
	}
}
