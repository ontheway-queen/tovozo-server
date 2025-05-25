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

  public async checkUser({
    email,
    id,
    username,
    type,
    user_name,
    phone_number,
  }: ICheckUserParams): Promise<ICheckUserData> {
    return await this.db(this.TABLES.user)
      .withSchema(this.DBO_SCHEMA)
      .select("*")
      .where((qb) => {
        if (email) {
          qb.andWhere("email", email);
        }
        if (username) {
          qb.andWhere("username", username);
        }
        if (id) {
          qb.andWhere("id", id);
        }
        if (type) {
          qb.andWhere("type", type);
        }
        if (user_name) {
          qb.andWhere("user_name", user_name);
        }
        if (phone_number) {
          qb.andWhere("phone_number", phone_number);
        }
      })
      .first();
  }

  public async getSingleCommonAuthUser({
    schema_name,
    table_name,
    user_id,
    user_name,
    email,
    phone_number,
  }: {
    schema_name: "dbo" | "hotelier" | "job_seeker" | "admin";
    table_name: string;
    user_id?: number;
    user_name?: string;
    email?: string;
    phone_number?: string;
  }) {
    return await this.db(table_name)
      .withSchema(schema_name)
      .select("*")
      .where((qb) => {
        if (user_id) {
          qb.andWhere("user_id", user_id);
        }
        if (user_name) {
          qb.andWhere("user_name", user_name);
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
}
