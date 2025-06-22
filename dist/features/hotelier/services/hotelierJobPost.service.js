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
class HotelierJobPostService extends abstract_service_1.default {
    createJobPost(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.hotelier;
            const body = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.jobPostModel(trx);
                const organizationModel = this.Model.organizationModel(trx);
                const checkOrganization = yield organizationModel.getOrganization({
                    user_id,
                });
                if (!checkOrganization) {
                    throw new customError_1.default("Organization not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                body.job_post.organization_id = checkOrganization.id;
                const res = yield model.createJobPost(body.job_post);
                if (!res.length) {
                    throw new customError_1.default(this.ResMsg.HTTP_BAD_REQUEST, this.StatusCode.HTTP_BAD_REQUEST);
                }
                yield model.createJobPostDetails(body.job_post_details);
                return {
                    success: true,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
}
exports.default = HotelierJobPostService;
