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
const constants_1 = require("../../../utils/miscellaneous/constants");
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class HotelierJobTaskActivitiesService extends abstract_service_1.default {
    constructor() {
        super();
        this.approveJobTaskActivity = (req) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const taskActivity = yield jobTaskActivitiesModel.getSingleTaskActivity(Number(id), null);
                if (taskActivity.application_status !== constants_1.JOB_APPLICATION_STATUS.ENDED) {
                    throw new customError_1.default(`You cannot perform this action because the application is not ended yet.`, this.StatusCode.HTTP_FORBIDDEN);
                }
                const application = yield jobApplicationModel.getMyJobApplication({
                    job_application_id: taskActivity.job_application_id,
                    job_seeker_id: taskActivity.job_seeker_id,
                });
                if (!application) {
                    throw new customError_1.default(`Job application not found or does not belong to you.`, this.StatusCode.HTTP_NOT_FOUND);
                }
                yield jobApplicationModel.updateMyJobApplicationStatus(taskActivity.job_application_id, taskActivity.job_seeker_id, constants_1.JOB_APPLICATION_STATUS.COMPLETED);
                yield jobTaskActivitiesModel.updateJobTaskActivity(taskActivity.id, { approved_at: new Date().toISOString() });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
}
exports.default = HotelierJobTaskActivitiesService;
