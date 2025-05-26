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
                .withSchema("hotelier")
                .insert(payload, "id");
        });
    }
    updateOrganization(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization")
                .withSchema("hotelier")
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
                .withSchema("hotelier")
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
    deleteOrganization(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization")
                .withSchema("hotelier")
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
                .withSchema("hotelier")
                .insert(payload);
        });
    }
    getPhotos(organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization_photos")
                .withSchema("hotelier")
                .select("*")
                .where({ organization_id, is_deleted: false });
        });
    }
    deletePhoto(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization_photos")
                .withSchema("hotelier")
                .where({ id })
                .update({ is_deleted: true });
        });
    }
    // Amenities
    addAmenities(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization_amenities")
                .withSchema("hotelier")
                .insert(payload);
        });
    }
    getAmenities(organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization_amenities")
                .withSchema("hotelier")
                .select("*")
                .where({ organization_id });
        });
    }
    deleteAmenities(organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("organization_amenities")
                .withSchema("hotelier")
                .where({ organization_id })
                .del();
        });
    }
}
exports.default = OrganizationModel;
