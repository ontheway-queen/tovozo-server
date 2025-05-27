"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class AdministrationModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //---Role---
    createRole(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("roles")
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload, "id");
        });
    }
    // update role
    updateRole(_a, id_1) {
        return __awaiter(this, arguments, void 0, function* ({ name, status }, id) {
            return yield this.db("roles")
                .withSchema(this.ADMIN_SCHEMA)
                .update({ name, status })
                .where({ id });
        });
    }
    roleList(limit_1, skip_1) {
        return __awaiter(this, arguments, void 0, function* (limit, skip, total = false) {
            var _a;
            const data = yield this.db("roles as rl")
                .withSchema(this.ADMIN_SCHEMA)
                .select("rl.id as role_id", "rl.name as role_name", "u.username as created_by", "rl.create_date")
                .leftJoin("admin as ua", "ua.user_id", "rl.created_by")
                .joinRaw("LEFT JOIN dbo.user u ON u.id = ua.user_id")
                .limit(limit ? limit : 100)
                .offset(skip ? skip : 0)
                .orderBy("rl.id", "asc");
            let count = [];
            if (total) {
                count = yield this.db("roles as rl")
                    .withSchema(this.ADMIN_SCHEMA)
                    .count("rl.id as total")
                    .join("admin as ua", "ua.user_id", "rl.created_by")
                    .joinRaw("LEFT JOIN dbo.user u ON u.id = ua.user_id");
            }
            return { data, total: (_a = count[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    getSingleRole(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, name, permission_id, }) {
            return yield this.db("roles as rol")
                .withSchema(this.ADMIN_SCHEMA)
                .select("rol.id as role_id", "rol.name as role_name", "rol.status", "rol.is_main_role", this.db.raw(`
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
    `))
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
        });
    }
    //---Permission---
    createPermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("permissions")
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload, "id");
        });
    }
    permissionsList(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db("permissions as per")
                .withSchema(this.ADMIN_SCHEMA)
                .select("per.id as permission_id", "per.name as permission_name", "u.username as created_by", "per.create_date")
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
            let count = [];
            count = yield this.db("permissions")
                .withSchema(this.ADMIN_SCHEMA)
                .count("id as total")
                .where((qb) => {
                if (params.name) {
                    qb.where("name", params.name);
                }
            });
            return { data, total: (_a = count[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //---Role Permission---
    createRolePermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("role_permissions")
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload, "role_id");
        });
    }
    // delete role permission
    deleteRolePermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("role_permissions")
                .withSchema(this.ADMIN_SCHEMA)
                .delete()
                .where("role_id", payload.role_id)
                .andWhere("permission_id", payload.permission_id);
        });
    }
    // update role permission
    updateRolePermission(payload, permission_id, role_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("role_permissions")
                .withSchema(this.ADMIN_SCHEMA)
                .update(payload)
                .where("role_id", role_id)
                .andWhere("permission_id", permission_id);
        });
    }
    // get role permission
    getRolePermissions(role_id, permission_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("role_permissions")
                .withSchema(this.ADMIN_SCHEMA)
                .where({ role_id })
                .andWhere({ permission_id });
        });
    }
    //get all admin
    getAllAdmin(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db("admin as ua")
                .withSchema(this.ADMIN_SCHEMA)
                .select("ua.user_id", "u.username", "ua.email", "ua.phone_number", "ua.photo", "rl.name as role", "ua.status", "ua.socket_id", "ua.twoFA")
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
                if (query.status === "true" || query.status === "false") {
                    qb.andWhere("u.status", query.status);
                }
            })
                .orderBy("ua.user_id", "desc")
                .limit(query.limit ? query.limit : 100)
                .offset(query.skip ? query.skip : 0);
            let total = [];
            if (is_total) {
                total = yield this.db("admin as ua")
                    .withSchema(this.ADMIN_SCHEMA)
                    .count("u.user_id as total")
                    .join("roles as rl", "rl.id", "u.role_id")
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
                    if (query.status === "true" || query.status === "false") {
                        qb.andWhere("u.status", query.status);
                    }
                });
            }
            return {
                data: data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    //get single admin
    getSingleAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("admin as ua")
                .select("ua.*", "rl.name as role", "rl.id as role_id")
                .withSchema(this.ADMIN_SCHEMA)
                .leftJoin("roles as rl", "rl.id", "ua.role_id")
                .where((qb) => {
                if (payload.id) {
                    qb.where("ua.user_id", payload.id);
                }
                if (payload.email) {
                    qb.orWhere("email", payload.email);
                }
                if (payload.phone_number) {
                    qb.orWhere("phone_number", payload.phone_number);
                }
                if (payload.username) {
                    qb.orWhere("username", payload.username);
                }
            });
        });
    }
}
exports.default = AdministrationModel;
