import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
	ICreateOrganizationPayload,
	IGetOrganization,
	IGetOrganizationList,
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
		return await this.db("organization as org")
			.withSchema(this.HOTELIER)
			.select(
				"org.id",
				"org.user_id",
				"org.name",
				"org.details",
				"org.photo",
				"org.status",
				"org.is_deleted",
				"org.is_2fa_on",
				"org.location_id",
				"l.address",
				"l.longitude",
				"l.latitude"
			)
			.joinRaw(`LEFT JOIN ?? as l ON l.id = org.location_id`, [
				`${this.DBO_SCHEMA}.${this.TABLES.location}`,
			])
			.where((qb) => {
				if (where.id) qb.andWhere("org.id", where.id);
				if (where.user_id) qb.andWhere("org.user_id", where.user_id);
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
	}): Promise<{ data: IGetOrganizationList[]; total: number }> {
		const data = await this.db("organization as org")
			.withSchema(this.HOTELIER)
			.joinRaw(`left join ?? as u on u.id = org.user_id`, [
				`${this.DBO_SCHEMA}.${this.TABLES.user}`,
			])
			.select(
				"org.id",
				"org.name as org_name",
				"org.photo as org_photo",
				"org.user_id",
				"org.created_at",
				"org.status",
				"org.is_2fa_on",
				"u.email as user_email",
				"u.phone_number as user_phone_number"
			)
			.where((qb) => {
				qb.where("org.is_deleted", false);
				if (params.id) qb.andWhere("org.id", params.id);
				if (params.user_id) qb.andWhere("org.user_id", params.user_id);
				if (params.status) qb.andWhere("org.status", params.status);
				if (params.name)
					qb.andWhereILike("org.name", `%${params.name}%`);
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
				qb.where("is_deleted", false);
				if (params.id) qb.andWhere("id", params.id);
				if (params.user_id) qb.andWhere("user_id", params.user_id);
				if (params.status) qb.andWhere("status", params.status);
				if (params.name) qb.andWhereILike("name", `%${params.name}%`);
				if (params.from_date && params.to_date)
					qb.andWhereBetween("created_at", [
						params.from_date,
						params.to_date,
					]);
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
			.select(
				"org.id",
				"org.name as org_name",
				"org.photo as org_photo",
				"org.user_id",
				"org.details",
				"org.created_at",
				"org.status",
				"org.is_2fa_on",
				"org.location_id",
				"la.location_name",
				"la.location_address as address",
				"la.city_id",
				"la.city_name",
				"la.state_id",
				"la.state_name",
				"la.country_id",
				"la.country_name",
				"la.longitude",
				"la.latitude",
				"la.postal_code",
				"u.email",
				"u.phone_number",
				"u.name",
				"u.photo"
			)
			.joinRaw(`left join ?? as u on u.id = org.user_id`, [
				`${this.DBO_SCHEMA}.${this.TABLES.user}`,
			])
			.joinRaw(`left join ?? as la on la.location_id = org.location_id`, [
				`${this.DBO_SCHEMA}.vw_location`,
			])
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
}
