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
const database_1 = require("../../../app/database");
const socket_1 = require("../../../app/socket");
const commonModel_1 = __importDefault(require("../../../models/commonModel/commonModel"));
const rootModel_1 = __importDefault(require("../../../models/rootModel"));
const lib_1 = __importDefault(require("../../lib/lib"));
const constants_1 = require("../../miscellaneous/constants");
const commonModelTypes_1 = require("../../modelTypes/common/commonModelTypes");
const userModelTypes_1 = require("../../modelTypes/user/userModelTypes");
class JobPostWorker {
    expireJobPostDetails(job) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = job.data;
            return yield database_1.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobPostModel = new rootModel_1.default().jobPostModel(trx);
                yield jobPostModel.updateJobPost(id, {
                    status: constants_1.JOB_POST_STATUS.Expired,
                });
                yield jobPostModel.updateJobPost(id, {
                    status: constants_1.JOB_POST_STATUS.Expired,
                });
                const jobs = yield jobPostModel.getAllJobsUsingJobPostId({
                    id,
                    status: "Pending",
                });
                if (jobs.length > 0) {
                    yield Promise.all(jobs.map((job) => jobPostModel.updateJobPostDetailsStatus({
                        id: job.id,
                        status: constants_1.JOB_POST_DETAILS_STATUS.Expired,
                    })));
                }
            }));
        });
    }
    jobStartReminder(job) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, hotelier_id, job_seeker_id, photo, title, content, type, related_id, job_seeker_device_id, } = job.data;
            return yield database_1.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const commonModel = new commonModel_1.default(trx);
                yield commonModel.createNotification({
                    user_id: job_seeker_id,
                    sender_id: hotelier_id,
                    sender_type: userModelTypes_1.TypeUser.HOTELIER,
                    title,
                    content,
                    type,
                    related_id,
                });
                const isJobSeekerOnline = yield (0, socket_1.getAllOnlineSocketIds)({
                    user_id: job_seeker_id,
                    type: userModelTypes_1.TypeUser.JOB_SEEKER,
                });
                if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
                    socket_1.io.to(String(job_seeker_id)).emit(commonModelTypes_1.TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION, {
                        user_id: job_seeker_id,
                        photo,
                        title,
                        content,
                        related_id,
                        type,
                        read_status: false,
                        created_at: new Date().toISOString(),
                    });
                }
                else {
                    if (job_seeker_device_id) {
                        if (job_seeker_device_id) {
                            yield lib_1.default.sendNotificationToMobile({
                                to: job_seeker_device_id,
                                notificationTitle: title,
                                notificationBody: content,
                                data: JSON.stringify({
                                    photo,
                                    related_id,
                                }),
                            });
                        }
                    }
                }
            }));
        });
    }
}
exports.default = JobPostWorker;
