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
class OrganizationModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createOrganization(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization")
                .withSchema(this.HOTELIER)
                .insert(payload, "id");
        });
    }
    updateOrganization(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization")
                .withSchema(this.HOTELIER)
                .update(payload)
                .where((qb) => {
                if (where.id)
                    qb.andWhere("id", where.id);
                if (where.user_id)
                    qb.andWhere("user_id", where.user_id);
            });
        });
    }
    getOrganization(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization")
                .withSchema(this.HOTELIER)
                .select("*")
                .where((qb) => {
                if (where.id)
                    qb.andWhere("id", where.id);
                if (where.user_id)
                    qb.andWhere("user_id", where.user_id);
            })
                .first();
        });
    }
    getOrganizationList(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("organization as org")
                .withSchema(this.HOTELIER)
                .joinRaw(`left join ?? as u on u.id = org.user_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.user}`,
            ])
                .select("org.*", "u.email as user_email", "u.phone_number as user_phone_number", "u.photo as user_photo")
                .where((qb) => {
                if (params.id)
                    qb.andWhere("org.id", params.id);
                if (params.user_id)
                    qb.andWhere("org.user_id", params.user_id);
                if (params.status)
                    qb.andWhere("org.status", params.status);
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
            const total = yield this.db("organization")
                .withSchema(this.HOTELIER)
                .count("id as total")
                .where((qb) => {
                if (params.id)
                    qb.andWhere("id", params.id);
                if (params.user_id)
                    qb.andWhere("user_id", params.user_id);
                if (params.status)
                    qb.andWhere("status", params.status);
                if (params.name)
                    qb.andWhereILike("name", `%${params.name}%`);
                if (params.from_date && params.to_date)
                    qb.andWhereBetween("created_at", [params.from_date, params.to_date]);
            })
                .first();
            return {
                data,
                total: (total === null || total === void 0 ? void 0 : total.total) ? Number(total.total) : 0,
            };
        });
    }
    getSingleOrganization(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization as org")
                .withSchema(this.HOTELIER)
                .joinRaw(`left join ?? as u on u.id = org.user_id`, [
                `${this.DBO_SCHEMA}.${this.TABLES.user}`,
            ])
                .joinRaw(`left join ?? as la on la.location_id = org.location_id`, [
                `${this.DBO_SCHEMA}.vw_location`,
            ])
                .leftJoin("maintenance_designation as md", "md.user_id", "org.user_id")
                .select("org.*", "md.designation", "la.location_name", "la.location_address", "la.city_name", "la.state_name", "la.country_name", "la.longitude", "la.latitude", "la.city_id", "la.state_id", "la.country_id", "la.postal_code", "u.email", "u.phone_number", "u.name", "u.photo")
                .where("org.id", id)
                .andWhere("org.is_deleted", false)
                .first();
        });
    }
    deleteOrganization(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization")
                .withSchema(this.HOTELIER)
                .where((qb) => {
                if (where.id)
                    qb.andWhere("id", where.id);
                if (where.user_id)
                    qb.andWhere("user_id", where.user_id);
            })
                .update({ is_deleted: true });
        });
    }
    // Photos
    addPhoto(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization_photos")
                .withSchema(this.HOTELIER)
                .insert(payload);
        });
    }
    getPhotos(organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization_photos")
                .withSchema(this.HOTELIER)
                .select("*")
                .where({ organization_id, is_deleted: false });
        });
    }
    deletePhoto(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization_photos")
                .withSchema(this.HOTELIER)
                .where({ id })
                .update({ is_deleted: true });
        });
    }
    // Amenities
    addAmenities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization_amenities")
                .withSchema(this.HOTELIER)
                .insert(payload);
        });
    }
    getAmenities(_a) {
        return __awaiter(this, arguments, void 0, function* ({ organization_id, id, amenity, }) {
            return yield this.db("organization_amenities")
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
        });
    }
    deleteAmenities(_a) {
        return __awaiter(this, arguments, void 0, function* ({ organization_id, id, ids, }) {
            return yield this.db("organization_amenities")
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
        });
    }
    updateAmenities(amenity, organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization_amenities")
                .withSchema(this.HOTELIER)
                .update({ amenity })
                .where({ organization_id });
        });
    }
}
exports.default = OrganizationModel;
