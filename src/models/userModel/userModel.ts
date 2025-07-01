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
		payload: Partial<ICreateUserPayload> & { socket_id?: string },
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

	public async checkUser({
		email,
		id,
		username,
		type,
		phone_number,
	}: ICheckUserParams): Promise<ICheckUserData[]> {
		return await this.db(this.TABLES.user)
			.withSchema(this.DBO_SCHEMA)
			.select("*")
			.where((qb) => {
				qb.where("is_deleted", false).andWhere((qbc) => {
					if (id) {
						qbc.andWhere("id", id);
					}
					if (type) {
						qbc.andWhere("type", type).andWhere((subQbc) => {
							if (email) {
								subQbc.andWhere("email", email);
							}
							if (username) {
								subQbc.orWhere("username", username);
							}
							if (phone_number) {
								subQbc.orWhere("phone_number", phone_number);
							}
						});
					}
				});
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
		return await this.db(table_name)
			.withSchema(schema_name)
			.select("*")
			.where((qb) => {
				if (user_id) {
					qb.andWhere("user_id", user_id);
				}
				if (user_name) {
					qb.andWhere("username", user_name);
				}
				if (email) {
					qb.andWhere("email", email);
				}
				if (phone_number) {
					qb.andWhere("phone_number", phone_number);
				}
			})
			.first();
	}

	//get last  user Id
	public async getLastUserID(): Promise<number> {
		const data = await this.db("user")
			.withSchema(this.DBO_SCHEMA)
			.select("id")
			.orderBy("id", "desc")
			.limit(1);

		return data.length ? data[0].id : 0;
	}

	public async deleteUser(id: number) {
		return await this.db(this.TABLES.user)
			.withSchema(this.DBO_SCHEMA)
			.update({ is_deleted: true })
			.where({ id });
	}
}
