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
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class AdminJobSeekerService extends abstract_service_1.default {
    getJobSeekers(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, status, limit, skip } = req.query;
            const model = this.Model.jobSeekerModel();
            const data = yield model.getAllJobSeekerList({ name, limit, skip, status });
            return Object.assign({ success: true, message: this.ResMsg.HTTP_OK, code: this.StatusCode.HTTP_OK }, data);
        });
    }
    getSingleJobSeeker(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.jobSeekerModel();
            const data = yield model.getJobSeekerDetails({ user_id: id });
            if (!data) {
                return {
                    success: false,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateJobSeeker(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const model = this.Model.jobSeekerModel();
            const data = yield model.getJobSeekerDetails({ user_id: id });
            if (!data) {
                return {
                    success: false,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const files = req.files;
                const parsed = {
                    user: lib_1.default.safeParseJSON(req.body.user),
                    jobSeeker: lib_1.default.safeParseJSON(req.body.job_seeker),
                    jobSeekerInfo: lib_1.default.safeParseJSON(req.body.job_seeker_info) || {},
                    ownAddress: lib_1.default.safeParseJSON(req.body.own_address) || {},
                    addJobPreferences: lib_1.default.safeParseJSON(req.body.add_job_preferences) || [],
                    delJobPreferences: lib_1.default.safeParseJSON(req.body.del_job_preferences) || [],
                    addJobLocations: lib_1.default.safeParseJSON(req.body.add_job_locations) || [],
                    delJobLocations: lib_1.default.safeParseJSON(req.body.del_job_locations) || [],
                    updateJobLocations: lib_1.default.safeParseJSON(req.body.update_job_locations) || [],
                    addJobShifting: lib_1.default.safeParseJSON(req.body.add_job_shifting) || [],
                    delJobShifting: lib_1.default.safeParseJSON(req.body.del_job_shifting) || [],
                };
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "resume":
                            parsed.jobSeekerInfo.resume = filename;
                            break;
                        case "photo":
                            parsed.user.photo = filename;
                            break;
                        default:
                            throw new customError_1.default(this.ResMsg.UNKNOWN_FILE_FIELD, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                }
                const userModel = this.Model.UserModel(trx);
                const jobSeekerModel = this.Model.jobSeekerModel(trx);
                const commonModel = this.Model.commonModel(trx);
                const existingUser = yield userModel.checkUser({
                    id: id,
                    type: constants_1.USER_TYPE.JOB_SEEKER,
                });
                if (!existingUser) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND, "ERROR");
                }
                if (parsed.user.phone_number &&
                    parsed.user.phone_number !== existingUser.phone_number) {
                    const phoneExists = yield userModel.checkUser({
                        phone_number: parsed.user.phone_number,
                        type: constants_1.USER_TYPE.JOB_SEEKER,
                    });
                    if (phoneExists) {
                        throw new customError_1.default(this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                }
                const updateTasks = [];
                if (Object.keys(parsed.user).length > 0) {
                    updateTasks.push(userModel.updateProfile(parsed.user, { id }));
                }
                if (Object.keys(parsed.ownAddress).length > 0) {
                    updateTasks.push(commonModel.updateLocation(parsed.ownAddress, {
                        location_id: parsed.ownAddress.id,
                    }));
                }
                if (Object.keys(parsed.jobSeeker).length > 0) {
                    updateTasks.push(jobSeekerModel.updateJobSeeker(parsed.jobSeeker, { user_id: id }));
                }
                if (Object.keys(parsed.jobSeekerInfo).length > 0) {
                    updateTasks.push(jobSeekerModel.updateJobSeekerInfo(parsed.jobSeekerInfo, {
                        job_seeker_id: id,
                    }));
                }
                if (parsed.delJobPreferences.length > 0) {
                    updateTasks.push(jobSeekerModel.deleteJobPreferences({
                        job_seeker_id: id,
                        job_ids: parsed.delJobPreferences,
                    }));
                }
                if (parsed.delJobLocations.length > 0) {
                    updateTasks.push(jobSeekerModel.deleteJobLocations({
                        job_seeker_id: id,
                        location_ids: parsed.delJobLocations,
                    }));
                }
                if (parsed.delJobShifting.length > 0) {
                    updateTasks.push(jobSeekerModel.deleteJobShifting({
                        job_seeker_id: id,
                        name: parsed.delJobShifting,
                    }));
                }
                if (parsed.updateJobLocations.length > 0) {
                    for (const loc of parsed.updateJobLocations) {
                        updateTasks.push(commonModel.updateLocation(loc, { location_id: loc.id }));
                    }
                }
                if (parsed.addJobLocations.length > 0) {
                    const locationIds = yield commonModel.createLocation(parsed.addJobLocations);
                    const jobLocations = locationIds.map((loc) => ({
                        job_seeker_id: id,
                        location_id: loc.id,
                    }));
                    updateTasks.push(jobSeekerModel.setJobLocations(jobLocations));
                }
                if (parsed.addJobPreferences.length > 0) {
                    const existingPrefer = yield jobSeekerModel.getJobPreferences(id);
                    const existingJobIds = new Set(existingPrefer.map((p) => p.job_id));
                    const newPrefer = parsed.addJobPreferences.filter((id) => !existingJobIds.has(id));
                    if (newPrefer.length !== parsed.addJobPreferences.length) {
                        throw new customError_1.default("Some job preferences already exist", this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                    const preferences = newPrefer.map((job_id) => ({
                        job_seeker_id: id,
                        job_id,
                    }));
                    updateTasks.push(jobSeekerModel.setJobPreferences(preferences));
                }
                if (parsed.addJobShifting.length > 0) {
                    const existingShifts = yield jobSeekerModel.getJobShifting(id);
                    const existingShiftNames = new Set(existingShifts.map((s) => s.shift));
                    const newShifts = parsed.addJobShifting.filter((shift) => !existingShiftNames.has(shift));
                    if (newShifts.length !== parsed.addJobShifting.length) {
                        throw new customError_1.default("Some job shifts already exist", this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                    const shifts = newShifts.map((shift) => ({
                        job_seeker_id: id,
                        shift,
                    }));
                    updateTasks.push(jobSeekerModel.setJobShifting(shifts));
                }
                yield Promise.all(updateTasks);
                yield this.insertAdminAudit(trx, {
                    details: ``,
                    created_by: req.admin.user_id,
                    endpoint: req.originalUrl,
                    type: "UPDATE",
                    payload: JSON.stringify(parsed),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
}
exports.default = AdminJobSeekerService;
