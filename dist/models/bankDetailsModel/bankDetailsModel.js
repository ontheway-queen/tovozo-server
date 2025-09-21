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
class BankDetailsModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    addBankDetails(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ payload });
            return yield this.db("bank_details")
                .withSchema(this.JOB_SEEKER)
                .insert(payload, "id");
        });
    }
    getBankAccounts(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseQuery = this.db("bank_details as bd")
                .withSchema(this.JOB_SEEKER)
                .where("bd.is_deleted", false)
                .modify((qb) => {
                if (where.user_id) {
                    qb.andWhere("bd.job_seeker_id", where.user_id);
                }
                if (where.id) {
                    qb.andWhere("bd.id", where.id);
                }
                if (where.account_number) {
                    qb.andWhere("bd.account_number", where.account_number);
                }
                if (where.bank_code) {
                    qb.andWhere("bd.bank_code", where.bank_code);
                }
                if (where.account_name) {
                    qb.andWhereILike("bd.account_name", `%${where.account_name}%`);
                }
            });
            const result = yield baseQuery
                .clone()
                .count("bd.id as count");
            const total = Number(result[0].count);
            const data = yield baseQuery
                .clone()
                .select("bd.id", "bd.job_seeker_id", "bd.account_name", "bd.account_number", "bd.bank_code")
                .orderBy("bd.id", "desc")
                .modify((qb) => {
                if (where.limit) {
                    qb.limit(where.limit);
                }
                if (where.offset) {
                    qb.offset(where.offset);
                }
            })
                .limit(where.limit || 100)
                .offset(where.offset || 0);
            return {
                total,
                data,
            };
        });
    }
    removeBankAccount(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("bank_details")
                .withSchema(this.JOB_SEEKER)
                .update({ is_deleted: true })
                .where("id", where.id)
                .andWhere("job_seeker_id", where.user_id);
        });
    }
}
exports.default = BankDetailsModel;
