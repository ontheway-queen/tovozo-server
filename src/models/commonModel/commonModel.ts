import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
  IGetLastIdData,
  IGetLastIdParams,
  IGetOTPPayload,
  IInsertLastNoPayload,
  IInsertOTPPayload,
  IUpdateLastNoPayload,
} from "../../utils/modelTypes/common/commonModelTypes";

export default class CommonModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // get otp
  public async getOTP(payload: IGetOTPPayload) {
    const check = await this.db("email_otp")
      .withSchema(this.DBO_SCHEMA)
      .select("id", "hashed_otp as otp", "tried")
      .andWhere("email", payload.email)
      .andWhere("type", payload.type)
      .andWhere("matched", 0)
      .andWhere("tried", "<", 3)
      .andWhereRaw(`"create_date" + interval '3 minutes' > NOW()`);

    return check;
  }

  // insert OTP
  public async insertOTP(payload: IInsertOTPPayload) {
    return await this.db("email_otp")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  // update otp
  public async updateOTP(
    payload: { tried: number; matched?: number },
    where: { id: number }
  ) {
    return await this.db("email_otp")
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where("id", where.id);
  }

  public async insertLastNo(payload: IInsertLastNoPayload) {
    return await this.db(this.TABLES.last_no)
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, "id");
  }

  public async updateLastNo(payload: IUpdateLastNoPayload, id: number) {
    return await this.db(this.TABLES.last_no)
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where("id", id);
  }

  public async getLastId({
    type,
  }: IGetLastIdParams): Promise<IGetLastIdData | null> {
    return await this.db(this.TABLES.last_no)
      .withSchema(this.DBO_SCHEMA)
      .select("id", "last_id")
      .where("type", type)
      .first();
  }
}
