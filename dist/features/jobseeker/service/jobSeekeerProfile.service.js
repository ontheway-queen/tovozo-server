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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class JobSeekerProfileService extends abstract_service_1.default {
    constructor() {
        super();
        // get profile
        this.getProfile = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const userModel = this.Model.UserModel();
            const jobSeekerModel = this.Model.jobSeekerModel();
            const _a = yield userModel.getSingleCommonAuthUser({
                table_name: constants_1.USER_AUTHENTICATION_VIEW.JOB_SEEKER,
                schema_name: "jobseeker",
                user_id,
            }), { password_hash } = _a, rest = __rest(_a, ["password_hash"]);
            const jobPreferences = yield jobSeekerModel.getJobPreferences(user_id);
            const jobLocations = yield jobSeekerModel.getJobLocations(user_id);
            const jobShifts = yield jobSeekerModel.getJobShifting(user_id);
            const jobSeekerInfo = yield jobSeekerModel.getJobSeekerInfo({
                job_seeker_id: user_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, rest), { jobSeekerInfo,
                    jobPreferences,
                    jobLocations,
                    jobShifts }),
            };
        });
    }
    updateProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const files = req.files || [];
                const user = lib_1.default.safeParseJSON(req.body.user);
                const jobSeeker = lib_1.default.safeParseJSON(req.body.job_seeker);
                const jobPreferencesInput = lib_1.default.safeParseJSON(req.body.job_preferences);
                const jobLocationsInput = lib_1.default.safeParseJSON(req.body.job_locations);
                const jobShiftingInput = lib_1.default.safeParseJSON(req.body.job_shifting);
                const jobSeekerInfo = lib_1.default.safeParseJSON(req.body.job_seeker_info) || {};
                const { user_id } = req.jobSeeker;
                for (const { fieldname, filename } of files) {
                    if (fieldname === "resume") {
                        jobSeekerInfo.resume = filename;
                    }
                    else if (fieldname === "photo") {
                        user.photo = filename;
                    }
                    else {
                        throw new customError_1.default(this.ResMsg.UNKNOWN_FILE_FIELD, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                }
                const userModel = this.Model.UserModel(trx);
                const jobSeekerModel = this.Model.jobSeekerModel(trx);
                const existingUser = yield userModel.checkUser({
                    id: user_id,
                    type: constants_1.USER_TYPE.JOB_SEEKER,
                });
                if (!existingUser) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND, "ERROR");
                }
                if (Object.keys(user).length) {
                    yield userModel.updateProfile(user, { id: user_id });
                }
                yield jobSeekerModel.updateJobSeeker(jobSeeker, { user_id });
                const hasPreferences = Array.isArray(jobPreferencesInput);
                if (hasPreferences) {
                    yield jobSeekerModel.deleteJobPreferences(user_id);
                    const jobPreferences = jobPreferencesInput.map((job_id) => ({
                        job_seeker_id: user_id,
                        job_id,
                    }));
                    yield jobSeekerModel.setJobPreferences(jobPreferences);
                }
                const hasLocations = Array.isArray(jobLocationsInput);
                if (hasLocations) {
                    yield jobSeekerModel.deleteJobLocations(user_id);
                    const jobLocations = jobLocationsInput.map((location_id) => ({
                        job_seeker_id: user_id,
                        location_id,
                    }));
                    yield jobSeekerModel.setJobLocations(jobLocations);
                }
                const hasShifting = Array.isArray(jobShiftingInput);
                if (hasShifting) {
                    yield jobSeekerModel.deleteJobShifting(user_id);
                    const jobShifting = jobShiftingInput.map((shift) => ({
                        job_seeker_id: user_id,
                        shift,
                    }));
                    yield jobSeekerModel.setJobShifting(jobShifting);
                }
                yield jobSeekerModel.updateJobSeekerInfo(jobSeekerInfo, {
                    job_seeker_id: user_id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    //change password
    changePassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const { old_password, new_password } = req.body;
            const model = this.Model.UserModel();
            const user_details = yield model.getSingleCommonAuthUser({
                schema_name: "jobseeker",
                table_name: constants_1.USER_AUTHENTICATION_VIEW.JOB_SEEKER,
                user_id,
            });
            if (!user_details) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const verify_password = yield lib_1.default.compareHashValue(old_password, user_details.password_hash);
            if (!verify_password) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.PASSWORDS_DO_NOT_MATCH,
                };
            }
            const hashed_password = yield lib_1.default.hashValue(new_password);
            const password_changed = yield model.updateProfile({ password_hash: hashed_password }, { id: user_id });
            if (password_changed) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.PASSWORD_CHANGED,
                };
            }
            else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
}
exports.default = JobSeekerProfileService;
