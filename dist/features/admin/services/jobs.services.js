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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class AdminJobService extends abstract_service_1.default {
    createJob(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.admin;
            const body = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.jobModel(trx);
                if (body.hourly_rate !== body.job_seeker_pay + body.platform_fee) {
                    throw new customError_1.default("Hourly rate must be equal to job_seeker_pay and platform_fee.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const check = yield model.getAllJobs({ title: body.title, limit: "1" }, false);
                if (check.data.length) {
                    throw new customError_1.default("Job title already exists!", this.StatusCode.HTTP_CONFLICT);
                }
                const res = yield model.createJob(body);
                if (!res) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                yield this.insertAdminAudit(trx, {
                    details: `A new job titled "${body.title}" has been created.`,
                    endpoint: req.originalUrl,
                    created_by: user_id,
                    type: "CREATE",
                    payload: JSON.stringify(body),
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    getAllJob(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.jobModel();
            const data = yield model.getAllJobs(req.query);
            return Object.assign({ success: true, message: this.ResMsg.HTTP_OK, code: this.StatusCode.HTTP_OK }, data);
        });
    }
    updateJob(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { user_id } = req.admin;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.jobModel();
                const body = req.body;
                const check = yield model.getSingleJob(id);
                if (!check) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                if (body.title) {
                    const checkTitle = yield model.getAllJobs({ title: body.title, limit: "1" }, false);
                    if (checkTitle.data.length) {
                        throw new customError_1.default("Job title already exists!", this.StatusCode.HTTP_CONFLICT);
                    }
                }
                yield model.updateJob(body, id);
                yield this.insertAdminAudit(trx, {
                    details: `The job titled "${check.title}(${id})" has been updated.`,
                    endpoint: `${req.originalUrl}`,
                    created_by: user_id,
                    type: "UPDATE",
                    payload: JSON.stringify(body),
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
    }
    deleteJob(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { user_id } = req.admin;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.jobModel();
                const check = yield model.getSingleJob(id);
                if (!check) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                yield model.deleteJob(id);
                yield this.insertAdminAudit(trx, {
                    details: `The job titled "${check.title}(${id})" has been deleted.`,
                    endpoint: `${req.originalUrl}`,
                    created_by: user_id,
                    type: "DELETE",
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
    }
}
exports.default = AdminJobService;
