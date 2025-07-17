import { db } from "../../app/database";
import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
  IGetAllCityParams,
  IGetAllCountryParams,
  IGetAllStatesParams,
  IGetCity,
  IGetCountry,
  IGetLastIdData,
  IGetLastIdParams,
  IGetLocationView,
  IGetNationality,
  IGetNotification,
  IGetNotificationParams,
  IGetOTP,
  IGetOTPPayload,
  IGetState,
  IInsertLastNoPayload,
  IInsertOTPPayload,
  ILocationPayload,
  ILocationUpdatePayload,
  INotificationPayload,
  INotificationUserPayload,
  IUpdateLastNoPayload,
} from "../../utils/modelTypes/common/commonModelTypes";

export default class CommonModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // get otp
  public async getOTP(payload: IGetOTPPayload): Promise<IGetOTP[]> {
    return await this.db("email_otp")
      .withSchema(this.DBO_SCHEMA)
      .select("id", "hashed_otp", "tried")
      .andWhere("email", payload.email)
      .andWhere("type", payload.type)
      .andWhere("matched", 0)
      .andWhere("tried", "<", 3)
      .andWhereRaw(`"create_date" + interval '3 minutes' > NOW()`)
      .orderBy("id", "desc");
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
  public async getAllCountry(
    payload: IGetAllCountryParams
  ): Promise<IGetCountry[]> {
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
  }: IGetAllCityParams): Promise<IGetCity[]> {
    return await this.db("cities")
      .withSchema(this.DBO_SCHEMA)
      .select(this.db.raw("id"), "name")
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
  }: IGetAllStatesParams): Promise<IGetState[]> {
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

  public async getLocation(query: {
    location_id: number;
  }): Promise<IGetLocationView> {
    return await this.db("vw_location")
      .withSchema(this.DBO_SCHEMA)
      .select("*")
      .where((qb) => {
        if (query.location_id) {
          qb.andWhere("location_id", query.location_id);
        }
      })
      .first();
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

  public async createNotification(
    payload: INotificationPayload | INotificationPayload[]
  ) {
    return await this.db(this.TABLES.notification)
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  public async getNotification(
    params: IGetNotificationParams
  ): Promise<{ data: IGetNotification[]; total?: number | string }> {
    const { limit = 100, skip = 0, id, user_id, need_total = true } = params;

    const data = await this.db(`${this.TABLES.notification} as n`)
      .withSchema(this.DBO_SCHEMA)
      .select(
        "n.id",
        "n.user_id",
        "n.content",
        "n.created_at",
        "n.related_id",
        "n.type",
        "u.type as user_type",
        this.db.raw(`
        CASE
          WHEN ns.user_id IS NOT NULL THEN true
          ELSE false
        END AS is_read
      `)
      )
      .leftJoin("user as u", "u.id", "n.user_id")
      .leftJoin(`${this.TABLES.notification_seen} as ns`, function () {
        this.on("ns.notification_id", "n.id").andOn(
          "ns.user_id",
          db.raw("?", [user_id])
        );
      })
      .leftJoin(`${this.TABLES.notification_delete} as nd`, function () {
        this.on("nd.notification_id", "n.id").andOn(
          "nd.user_id",
          db.raw("?", [user_id])
        );
      })
      .whereNull("nd.notification_id")
      .andWhere((qb) => {
        if (user_id) qb.andWhere("n.user_id", user_id);
        if (id) qb.andWhere("n.id", id);
      })
      .orderBy("n.created_at", "desc")
      .limit(Number(limit))
      .offset(Number(skip));
    let total;
    if (need_total) {
      const totalQuery = await this.db(`${this.TABLES.notification} as n`)
        .withSchema(this.DBO_SCHEMA)
        .count("n.id as total")
        .leftJoin(`${this.TABLES.notification_seen} as ns`, function () {
          this.on("ns.notification_id", "n.id").andOn(
            "ns.user_id",
            db.raw("?", [user_id])
          );
        })
        .leftJoin(`${this.TABLES.notification_delete} as nd`, function () {
          this.on("nd.notification_id", "n.id").andOn(
            "nd.user_id",
            db.raw("?", [user_id])
          );
        })
        .whereNull("nd.notification_id")
        .andWhere((qb) => {
          if (id) qb.andWhere("n.id", id);
          if (user_id) qb.andWhere("n.user_id", user_id);
        })
        .first();
      total = totalQuery?.total ? Number(totalQuery.total) : 0;
    }

    return {
      data,
      total,
    };
  }

  public async deleteNotification(
    payload: INotificationUserPayload | INotificationUserPayload[]
  ) {
    return await this.db(this.TABLES.notification_delete)
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  public async readNotification(payload: INotificationUserPayload) {
    return await this.db(this.TABLES.notification_seen)
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  public async getAllNationality(params: IGetNationality) {
    const { name, limit = 100, skip = 0 } = params;
    const data = await this.db(this.TABLES.nationality)
      .withSchema(this.DBO_SCHEMA)
      .select("id", "name", "created_at")
      .where((qb) => {
        qb.where("status", true);
        if (name) {
          qb.whereILike("name", `%${name}%`);
        }
      })
      .orderBy("name", "asc")
      .limit(limit)
      .offset(skip);

    const total = await this.db(this.TABLES.nationality)
      .withSchema(this.DBO_SCHEMA)
      .count("id as total")
      .where((qb) => {
        qb.where("status", true);
        if (name) {
          qb.whereILike("name", `%${name}%`);
        }
      })
      .first();

    return {
      data,
      total: total?.total,
    };
  }
}
