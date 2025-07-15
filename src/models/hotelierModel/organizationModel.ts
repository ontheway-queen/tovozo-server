import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
  ICreateAmenityPayload,
  ICreateOrganizationPayload,
  ICreatePhotoPayload,
  IGetOrganization,
  IUpdateOrganizationPayload,
} from "../../utils/modelTypes/hotelier/organizationModelTypes";

export default class OrganizationModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createOrganization(payload: ICreateOrganizationPayload) {
    return await this.db("organization")
      .withSchema(this.HOTELIER)
      .insert(payload, "id");
  }

  public async updateOrganization(
    payload: Partial<IUpdateOrganizationPayload>,
    where: { id?: number; user_id?: number }
  ) {
    return await this.db("organization")
      .withSchema(this.HOTELIER)
      .update(payload)
      .where((qb) => {
        if (where.id) qb.andWhere("id", where.id);
        if (where.user_id) qb.andWhere("user_id", where.user_id);
      });
  }

  public async getOrganization(where: {
    id?: number;
    user_id?: number;
  }): Promise<IGetOrganization> {
    return await this.db("organization")
      .withSchema(this.HOTELIER)
      .select("*")
      .where((qb) => {
        if (where.id) qb.andWhere("id", where.id);
        if (where.user_id) qb.andWhere("user_id", where.user_id);
      })
      .first();
  }

  public async getOrganizationList(params: {
    id?: number;
    user_id?: number;
    name?: string;
    limit?: number;
    status?: string;
    from_date?: string;
    to_date?: string;
    skip?: number;
  }): Promise<{ data: IGetOrganization[]; total: number }> {
    const data = await this.db("organization as org")
      .withSchema(this.HOTELIER)
      .joinRaw(`left join ?? as u on u.id = org.user_id`, [
        `${this.DBO_SCHEMA}.${this.TABLES.user}`,
      ])
      .select(
        "org.*",
        "u.email as user_email",
        "u.phone_number as user_phone_number",
        "u.photo as user_photo"
      )
      .where((qb) => {
        if (params.id) qb.andWhere("org.id", params.id);
        if (params.user_id) qb.andWhere("org.user_id", params.user_id);
        if (params.status) qb.andWhere("org.status", params.status);
        if (params.name) qb.andWhereILike("org.name", `%${params.name}%`);
        if (params.from_date && params.to_date)
          qb.andWhereBetween("org.created_at", [
            params.from_date,
            params.to_date,
          ]);
      })
      .orderBy("org.created_at", "desc")
      .limit(params.limit || 100)
      .offset(params.skip || 0);

    const total = await this.db("organization")
      .withSchema(this.HOTELIER)
      .count("id as total")
      .where((qb) => {
        if (params.id) qb.andWhere("id", params.id);
        if (params.user_id) qb.andWhere("user_id", params.user_id);
        if (params.status) qb.andWhere("status", params.status);
        if (params.name) qb.andWhereILike("name", `%${params.name}%`);
        if (params.from_date && params.to_date)
          qb.andWhereBetween("created_at", [params.from_date, params.to_date]);
      })
      .first();
    return {
      data,
      total: total?.total ? Number(total.total) : 0,
    };
  }

  public async getSingleOrganization(id: number): Promise<IGetOrganization> {
    return await this.db("organization as org")
      .withSchema(this.HOTELIER)

      .joinRaw(`left join ?? as u on u.id = org.user_id`, [
        `${this.DBO_SCHEMA}.${this.TABLES.user}`,
      ])
      .joinRaw(`left join ?? as la on la.location_id = org.location_id`, [
        `${this.DBO_SCHEMA}.vw_location`,
      ])
      .leftJoin("maintenance_designation as md", "md.user_id", "org.user_id")
      .select(
        "org.*",
        "md.designation",
        "la.location_name",
        "la.location_address",
        "la.city_name",
        "la.state_name",
        "la.country_name",
        "la.longitude",
        "la.latitude",
        "la.city_id",
        "la.state_id",
        "la.country_id",
        "la.postal_code",
        "u.email",
        "u.phone_number",
        "u.name",
        "u.photo"
      )
      .where("org.id", id)
      .andWhere("org.is_deleted", false)
      .first();
  }

  public async deleteOrganization(where: { id?: number; user_id?: number }) {
    return await this.db("organization")
      .withSchema(this.HOTELIER)
      .where((qb) => {
        if (where.id) qb.andWhere("id", where.id);
        if (where.user_id) qb.andWhere("user_id", where.user_id);
      })
      .update({ is_deleted: true });
  }

  // Photos
  public async addPhoto(payload: ICreatePhotoPayload | ICreatePhotoPayload[]) {
    return await this.db("organization_photos")
      .withSchema(this.HOTELIER)
      .insert(payload);
  }

  public async getPhotos(organization_id: number) {
    return await this.db("organization_photos")
      .withSchema(this.HOTELIER)
      .select("*")
      .where({ organization_id, is_deleted: false });
  }

  public async deletePhoto(id: number) {
    return await this.db("organization_photos")
      .withSchema(this.HOTELIER)
      .where({ id })
      .update({ is_deleted: true });
  }

  // Amenities
  public async addAmenities(
    payload: ICreateAmenityPayload | ICreateAmenityPayload[]
  ) {
    return await this.db("organization_amenities")
      .withSchema(this.HOTELIER)
      .insert(payload);
  }

  public async getAmenities({
    organization_id,
    id,
    amenity,
  }: {
    organization_id?: number;
    amenity?: string;
    id?: number;
  }) {
    return await this.db("organization_amenities")
      .withSchema(this.HOTELIER)
      .select("*")
      .where((qb) => {
        if (organization_id) {
          qb.where({ organization_id });
        }
        if (amenity) {
          qb.andWhere({ amenity });
        }
        if (id) {
          qb.andWhere({ id });
        }
      });
  }

  public async deleteAmenities({
    organization_id,
    id,
    ids,
  }: {
    organization_id?: number;
    id?: number;
    ids?: number[];
  }) {
    return await this.db("organization_amenities")
      .withSchema(this.HOTELIER)
      .where((qb) => {
        if (ids && ids.length) {
          qb.whereIn("id", ids);
        }
        if (organization_id) {
          qb.andWhere({ organization_id });
        }
        if (id) {
          qb.andWhere({ id });
        }
      })
      .del();
  }
  public async updateAmenities(amenity: string, organization_id: number) {
    return await this.db("organization_amenities")
      .withSchema(this.HOTELIER)
      .update({ amenity })
      .where({ organization_id });
  }
}
