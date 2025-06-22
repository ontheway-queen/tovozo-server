import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
  IAdminSearchQuery,
  IGetAdminListFilterQuery,
} from "../../utils/modelTypes/admin/administrationType";
import {
  ICreateAdmin,
  ICreateAdminAuditTrailPayload,
} from "../../utils/modelTypes/admin/adminModelTypes";

export default class AdminModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }
  //create audit
  public async createAudit(payload: ICreateAdminAuditTrailPayload) {
    return await this.db(this.TABLES.audit_trail)
      .withSchema(this.ADMIN_SCHEMA)
      .insert(payload);
  }

  // create admin
  public async createAdmin(payload: ICreateAdmin) {
    return await this.db("admin")
      .withSchema(this.ADMIN_SCHEMA)
      .insert(payload, "user_id");
  }

  // update admin
  public async updateAdmin(
    payload: Partial<ICreateAdmin>,
    query: { user_id?: number }
  ) {
    return await this.db("admin")
      .withSchema(this.ADMIN_SCHEMA)
      .update(payload)
      .where((qb) => {
        if (query.user_id) {
          qb.andWhere("user_id", query.user_id);
        }
      });
  }

  //get all admin
  public async getAllAdmin(
    query: IGetAdminListFilterQuery,
    is_total: boolean = false
  ) {
    const data = await this.db("admin as ua")
      .withSchema(this.ADMIN_SCHEMA)
      .select(
        "ua.user_id",
        "u.username",
        "u.name",
        "u.email",
        "u.phone_number",
        "u.photo",
        "u.status",
        "u.socket_id",
        "rl.name as role",
        "rl.id as role_id",
        "ua.is_2fa_on"
      )
      .leftJoin("roles as rl", "rl.id", "ua.role_id")
      .joinRaw("LEFT JOIN dbo.user u ON u.id = ua.user_id")
      .where((qb) => {
        if (query.filter) {
          qb.where((qbc) => {
            qbc.where("u.username", "ilike", `%${query.filter}%`);
            qbc.orWhere("u.email", "ilike", `%${query.filter}%`);
            qbc.orWhere("u.phone_number", "ilike", `%${query.filter}%`);
          });
        }
        if (query.role) {
          qb.andWhere("rl.id", query.role);
        }
        if (query.status !== undefined) {
          qb.andWhere("u.status", query.status);
        }
      })
      .orderBy("ua.user_id", "desc")
      .limit(query.limit ? query.limit : 100)
      .offset(query.skip ? query.skip : 0);

    let total: any[] = [];

    if (is_total) {
      total = await this.db("admin as ua")
        .withSchema(this.ADMIN_SCHEMA)
        .count("u.id as total")
        .leftJoin("roles as rl", "rl.id", "ua.role_id")
        .joinRaw("LEFT JOIN dbo.user u ON u.id = ua.user_id")
        .where((qb) => {
          if (query.filter) {
            qb.where((qbc) => {
              qbc.where("u.username", "ilike", `%${query.filter}%`);
              qbc.orWhere("u.email", "ilike", `%${query.filter}%`);
              qbc.orWhere("u.phone_number", "ilike", `%${query.filter}%`);
            });
          }
          if (query.role) {
            qb.andWhere("rl.id", query.role);
          }
          if (query.status !== undefined) {
            qb.andWhere("u.status", query.status);
          }
        });
    }

    return {
      data: data,
      total: total[0]?.total,
    };
  }

  //get single admin
  public async getSingleAdmin(payload: IAdminSearchQuery) {
    return await this.db("admin as ua")
      .select(
        "ua.*",
        "u.username",
        "u.name",
        "u.email",
        "u.phone_number",
        "u.photo",
        "u.password_hash",
        "u.status",
        "u.socket_id",
        "rl.name as role",
        "rl.id as role_id"
      )
      .withSchema(this.ADMIN_SCHEMA)
      .leftJoin("roles as rl", "rl.id", "ua.role_id")
      .joinRaw("LEFT JOIN dbo.user u ON u.id = ua.user_id")
      .where((qb) => {
        if (payload.id) {
          qb.where("ua.user_id", payload.id);
        }
        if (payload.email) {
          qb.orWhere("u.email", payload.email);
        }
        if (payload.phone_number) {
          qb.orWhere("u.phone_number", payload.phone_number);
        }
        if (payload.username) {
          qb.orWhere("u.username", payload.username);
        }
      });
  }
}
