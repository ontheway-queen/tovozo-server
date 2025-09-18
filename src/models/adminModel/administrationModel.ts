import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
	IGetSingleRole,
	IPermission,
	IPermissionList,
	IRole,
} from "../../utils/modelTypes/admin/administrationType";

class AdministrationModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	//---Role---

	public async createRole(payload: IRole) {
		return await this.db("roles")
			.withSchema(this.ADMIN_SCHEMA)
			.insert(payload, "id");
	}

	// update role
	public async updateRole(
		{ name, status }: { name?: string; status?: number },
		id: number
	) {
		return await this.db("roles")
			.withSchema(this.ADMIN_SCHEMA)
			.update({ name, status })
			.where({ id });
	}

	public async roleList(
		limit?: number,
		skip?: number,
		total: boolean = false
	) {
		const data = await this.db("roles as rl")
			.withSchema(this.ADMIN_SCHEMA)
			.select(
				"rl.id as role_id",
				"rl.name as role_name",
				"u.username as created_by",
				"rl.create_date"
			)
			.leftJoin("admin as ua", "ua.user_id", "rl.created_by")
			.joinRaw("LEFT JOIN dbo.user u ON u.id = ua.user_id")
			.limit(limit ? limit : 100)
			.offset(skip ? skip : 0)
			.orderBy("rl.id", "asc");

		let count: any[] = [];
		if (total) {
			count = await this.db("roles as rl")
				.withSchema(this.ADMIN_SCHEMA)
				.count("rl.id as total")
				.join("admin as ua", "ua.user_id", "rl.created_by")
				.joinRaw("LEFT JOIN dbo.user u ON u.id = ua.user_id");
		}

		return { data, total: count[0]?.total };
	}

	public async getSingleRole({
		id,
		name,
		permission_id,
	}: {
		id?: number;
		name?: string;
		permission_id?: number;
	}): Promise<IGetSingleRole[]> {
		return await this.db("roles as rol")
			.withSchema(this.ADMIN_SCHEMA)
			.select(
				"rol.id as role_id",
				"rol.name as role_name",
				"rol.status",
				"rol.is_main_role",
				this.db.raw(`
      case when exists (
        select 1
        from ${this.ADMIN_SCHEMA}.role_permissions rp
        where rp.role_id = rol.id
      ) then (
        select json_agg(
          json_build_object(
            'permission_id', per.id,
            'permission_name', per.name,
            'read', rp.read,
            'write', rp.write,
            'update', rp.update,
            'delete', rp.delete
          )
                order by per.name asc
        )
        from ${this.ADMIN_SCHEMA}.role_permissions rp
        left join ${this.ADMIN_SCHEMA}.permissions per
        on rp.permission_id = per.id
        where rp.role_id = rol.id
        group by rp.role_id
      ) else '[]' end as permissions
    `)
			)
			.where((qb) => {
				if (id) {
					qb.where("rol.id", id);
				}
				if (name) {
					qb.where("rol.name", name);
				}
				if (permission_id) {
					qb.andWhere("per.id", permission_id);
				}
			});
	}

	//---Permission---
	public async createPermission(payload: IPermission) {
		return await this.db("permissions")
			.withSchema(this.ADMIN_SCHEMA)
			.insert(payload, "id");
	}

	public async permissionsList(params: {
		name?: string;
		limit?: number;
		skip?: number;
	}): Promise<{ data: IPermissionList[]; total?: number | string }> {
		const data = await this.db("permissions as per")
			.withSchema(this.ADMIN_SCHEMA)
			.select(
				"per.id as permission_id",
				"per.name as permission_name",
				"u.username as created_by",
				"per.create_date"
			)
			.leftJoin("admin as ua", "ua.user_id", "per.created_by")
			.joinRaw("LEFT JOIN dbo.user u ON u.id = ua.user_id")
			.limit(params.limit ? params.limit : 100)
			.offset(params.skip ? params.skip : 0)
			.orderBy("per.id", "asc")
			.where((qb) => {
				if (params.name) {
					qb.where("per.name", params.name);
				}
			});

		let count: any[] = [];

		count = await this.db("permissions")
			.withSchema(this.ADMIN_SCHEMA)
			.count("id as total")
			.where((qb) => {
				if (params.name) {
					qb.where("name", params.name);
				}
			});

		return { data, total: count[0]?.total };
	}

	//---Role Permission---
	public async createRolePermission(payload: {
		role_id: number;
		permission_id: number;
	}) {
		return await this.db("role_permissions")
			.withSchema(this.ADMIN_SCHEMA)
			.insert(payload, "role_id");
	}

	// delete role permission
	public async deleteRolePermission(payload: {
		role_id: number;
		permission_id: number;
	}) {
		return await this.db("role_permissions")
			.withSchema(this.ADMIN_SCHEMA)
			.delete()
			.where("role_id", payload.role_id)
			.andWhere("permission_id", payload.permission_id);
	}

	// update role permission
	public async updateRolePermission(
		payload: {
			write: number;
			update: number;
			delete: number;
			read: number;
			updated_by: number;
		},
		permission_id: number,
		role_id: number
	) {
		return await this.db("role_permissions")
			.withSchema(this.ADMIN_SCHEMA)
			.update(payload)
			.where("role_id", role_id)
			.andWhere("permission_id", permission_id);
	}

	// get role permission
	public async getRolePermissions(role_id: number, permission_id: number) {
		return await this.db("role_permissions")
			.withSchema(this.ADMIN_SCHEMA)
			.where({ role_id })
			.andWhere({ permission_id });
	}

	// Get All Audit Trail
	public async getAllAuditTrail(params: {
		name?: string;
		limit?: number;
		skip?: number;
		type?: string;
	}) {
		const { name, type, limit = 100, skip = 0 } = params;

		const query = this.db("audit_trail as at")
			.withSchema(this.ADMIN_SCHEMA)
			.select(
				"at.id",
				"at.created_by",
				"at.endpoint",
				"at.details",
				"at.created_at",
				"u.username as created_by_username",
				"u.name as created_by_name",
				"at.type"
			)
			.joinRaw(`JOIN ?? as u on u.id = at.created_by`, [
				`${this.DBO_SCHEMA}.${this.TABLES.user}`,
			])
			.limit(limit)
			.offset(skip)
			.orderBy("at.id", "asc");

		if (name) {
			query.where((qb) => {
				qb.whereILike("at.details", `%${name}%`)
					.orWhereILike("at.endpoint", `%${name}%`)
					.orWhereILike("u.name", `%${name}%`)
					.orWhereILike("u.username", `%${name}%`);
			});
		}

		if (type) {
			query.where("at.type", type);
		}

		const data = await query;

		const countQuery = this.db("audit_trail as at")
			.withSchema(this.ADMIN_SCHEMA)
			.count("at.id as total")
			.joinRaw(`JOIN ?? as u on u.id = at.created_by`, [
				`${this.DBO_SCHEMA}.${this.TABLES.user}`,
			]);

		if (name) {
			countQuery.where((qb) => {
				qb.whereILike("at.details", `%${name}%`)
					.orWhereILike("at.endpoint", `%${name}%`)
					.orWhereILike("u.name", `%${name}%`)
					.orWhereILike("u.username", `%${name}%`);
			});
		}
		if (type) {
			countQuery.where("at.type", type);
		}

		const countResult = await countQuery;
		const total = countResult[0]?.total;

		return { data, total };
	}
}
export default AdministrationModel;
