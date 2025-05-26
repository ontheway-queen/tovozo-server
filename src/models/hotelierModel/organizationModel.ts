import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
  ICreateOrganizationPayload,
  IUpdateOrganizationPayload,
  ICreatePhotoPayload,
  ICreateAmenityPayload,
} from "../../utils/modelTypes/hotelier/organizationModelTypes";

export default class OrganizationModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createOrganization(payload: ICreateOrganizationPayload) {
    return await this.db("organization")
      .withSchema("hotelier")
      .insert(payload, "id");
  }

  public async updateOrganization(
    payload: Partial<IUpdateOrganizationPayload>,
    where: { id?: number; user_id?: number }
  ) {
    return await this.db("organization")
      .withSchema("hotelier")
      .update(payload)
      .where((qb) => {
        if (where.id) qb.andWhere("id", where.id);
        if (where.user_id) qb.andWhere("user_id", where.user_id);
      });
  }

  public async getOrganization(where: { id?: number; user_id?: number }) {
    return await this.db("organization")
      .withSchema("hotelier")
      .select("*")
      .where((qb) => {
        if (where.id) qb.andWhere("id", where.id);
        if (where.user_id) qb.andWhere("user_id", where.user_id);
      })
      .first();
  }

  public async deleteOrganization(where: { id?: number; user_id?: number }) {
    return await this.db("organization")
      .withSchema("hotelier")
      .where((qb) => {
        if (where.id) qb.andWhere("id", where.id);
        if (where.user_id) qb.andWhere("user_id", where.user_id);
      })
      .update({ is_deleted: true });
  }

  // Photos
  public async addPhoto(payload: ICreatePhotoPayload | ICreatePhotoPayload[]) {
    return await this.db("organization_photos")
      .withSchema("hotelier")
      .insert(payload);
  }

  public async getPhotos(organization_id: number) {
    return await this.db("organization_photos")
      .withSchema("hotelier")
      .select("*")
      .where({ organization_id, is_deleted: false });
  }

  public async deletePhoto(id: number) {
    return await this.db("organization_photos")
      .withSchema("hotelier")
      .where({ id })
      .update({ is_deleted: true });
  }

  // Amenities
  public async addAmenities(
    payload: ICreateAmenityPayload | ICreateAmenityPayload[]
  ) {
    return await this.db("organization_amenities")
      .withSchema("hotelier")
      .insert(payload);
  }

  public async getAmenities(organization_id: number) {
    return await this.db("organization_amenities")
      .withSchema("hotelier")
      .select("*")
      .where({ organization_id });
  }

  public async deleteAmenities(organization_id: number) {
    return await this.db("organization_amenities")
      .withSchema("hotelier")
      .where({ organization_id })
      .del();
  }
}
