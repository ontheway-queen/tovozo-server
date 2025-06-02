import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
  IGetLastIdData,
  IGetLastIdParams,
  IGetOTPPayload,
  IInsertLastNoPayload,
  IInsertOTPPayload,
  ILocationPayload,
  ILocationUpdatePayload,
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

  //get all country
  public async getAllCountry(payload: {
    id?: number;
    name?: string;
    iso2?: string;
    iso3?: string;
  }) {
    return await this.db("countries")
      .withSchema(this.DBO_SCHEMA)
      .select(
        "id",
        "name",
        "iso2",
        "iso3",
        "phonecode",
        "currency",
        "currency_name",
        "numeric_code"
      )
      .where((qb) => {
        if (payload.id) {
          qb.where("id", payload.id);
        }
        if (payload.name) {
          qb.andWhereILike("name", `%${payload.name}%`);
        }
        if (payload.iso2) {
          qb.andWhere("iso2", payload.iso2);
        }
        if (payload.iso3) {
          qb.andWhere("iso3", payload.iso3);
        }
      })
      .orderBy("name", "asc");
  }

  //get all city
  public async getAllCity({
    country_id,
    city_id,
    limit,
    skip,
    state_id,
    name,
  }: {
    country_id?: number;
    state_id?: number;
    city_id?: number;
    limit?: number;
    skip?: number;
    filter?: string;
    name?: string;
  }) {
    // console.log({ city_id });
    return await this.db("cities")
      .withSchema(this.DBO_SCHEMA)
      .select("id", "name")
      .where((qb) => {
        if (country_id) {
          qb.where({ country_id });
        }
        if (name) {
          qb.andWhere("name", "ilike", `%${name}%`);
        }

        if (city_id) {
          qb.andWhere("id", city_id);
        }
        if (state_id) {
          qb.andWhere("state_id", state_id);
        }
      })
      .orderBy("id", "asc")
      .limit(limit || 100)
      .offset(skip || 0);
  }

  // get all states
  public async getAllStates({
    country_id,
    state_id,
    limit,
    skip,
    name,
  }: {
    country_id?: number;
    state_id?: number;
    limit?: number;
    skip?: number;
    filter?: string;
    name?: string;
  }) {
    // console.log({ city_id });
    return await this.db("states")
      .withSchema(this.DBO_SCHEMA)
      .select("id", "name")
      .where((qb) => {
        if (country_id) {
          qb.where({ country_id });
        }
        if (name) {
          qb.andWhere("name", "ilike", `%${name}%`);
        }

        if (state_id) {
          qb.andWhere("state_id", state_id);
        }
      })
      .orderBy("id", "asc")
      .limit(limit || 100)
      .offset(skip || 0);
  }

  public async createLocation(payload: ILocationPayload | ILocationPayload[]) {
    return await this.db("location")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, "id");
  }

  public async updateLocation(
    payload: Partial<ILocationUpdatePayload>,
    query: {
      location_id: number;
    }
  ) {
    return await this.db("location")
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where((qb) => {
        if (query.location_id) {
          qb.andWhere("id", query.location_id);
        }
      });
  }
}
