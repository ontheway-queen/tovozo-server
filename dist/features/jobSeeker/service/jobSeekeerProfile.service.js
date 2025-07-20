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
const stripe_1 = require("../../../utils/miscellaneous/stripe");
class JobSeekerProfileService extends abstract_service_1.default {
    constructor() {
        super();
        // get profile
        this.getProfile = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const jobSeekerModel = this.Model.jobSeekerModel();
            const jobSeekerDetails = yield jobSeekerModel.getJobSeekerDetails({
                user_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: jobSeekerDetails,
            };
        });
    }
    updateProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const files = req.files || [];
                const { user_id } = req.jobSeeker;
                const parsed = {
                    user: lib_1.default.safeParseJSON(req.body.user) || {},
                    jobSeeker: lib_1.default.safeParseJSON(req.body.job_seeker) || {},
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
                const [existingUser] = yield userModel.checkUser({
                    id: user_id,
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
                    if (phoneExists && phoneExists.length > 0) {
                        throw new customError_1.default(this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                }
                const updateTasks = [];
                if (parsed.user && Object.keys(parsed.user).length > 0) {
                    updateTasks.push(userModel.updateProfile(parsed.user, { id: user_id }));
                }
                if (parsed.ownAddress &&
                    Object.keys(parsed.ownAddress).length > 0) {
                    updateTasks.push(commonModel.updateLocation(parsed.ownAddress, {
                        location_id: parsed.ownAddress.id,
                    }));
                }
                if (parsed.jobSeeker && Object.keys(parsed.jobSeeker).length > 0) {
                    updateTasks.push(jobSeekerModel.updateJobSeeker(parsed.jobSeeker, {
                        user_id,
                    }));
                }
                if (parsed.jobSeekerInfo &&
                    Object.keys(parsed.jobSeekerInfo).length > 0) {
                    updateTasks.push(jobSeekerModel.updateJobSeekerInfo(parsed.jobSeekerInfo, {
                        job_seeker_id: user_id,
                    }));
                }
                if (parsed.delJobPreferences.length > 0) {
                    updateTasks.push(jobSeekerModel.deleteJobPreferences({
                        job_seeker_id: user_id,
                        job_ids: parsed.delJobPreferences,
                    }));
                }
                if (parsed.delJobLocations.length > 0) {
                    updateTasks.push(jobSeekerModel.deleteJobLocations({
                        job_seeker_id: user_id,
                        location_ids: parsed.delJobLocations,
                    }));
                }
                if (parsed.delJobShifting.length > 0) {
                    updateTasks.push(jobSeekerModel.deleteJobShifting({
                        job_seeker_id: user_id,
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
                        job_seeker_id: user_id,
                        location_id: loc.id,
                    }));
                    updateTasks.push(jobSeekerModel.setJobLocations(jobLocations));
                }
                if (parsed.addJobPreferences.length > 0) {
                    const existingPrefs = yield jobSeekerModel.getJobPreferences(user_id);
                    const existingJobIds = new Set(existingPrefs.map((p) => p.job_id));
                    const newPrefs = parsed.addJobPreferences.filter((id) => !existingJobIds.has(id));
                    if (newPrefs.length !== parsed.addJobPreferences.length) {
                        throw new customError_1.default("Some job preferences already exist", this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                    const preferences = newPrefs.map((job_id) => ({
                        job_seeker_id: user_id,
                        job_id,
                    }));
                    updateTasks.push(jobSeekerModel.setJobPreferences(preferences));
                }
                if (parsed.addJobShifting.length > 0) {
                    const existingShifts = yield jobSeekerModel.getJobShifting(user_id);
                    const existingShiftNames = new Set(existingShifts.map((s) => s.shift));
                    const newShifts = parsed.addJobShifting.filter((shift) => !existingShiftNames.has(shift));
                    if (newShifts.length !== parsed.addJobShifting.length) {
                        throw new customError_1.default("Some job shifts already exist", this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                    const shifts = newShifts.map((shift) => ({
                        job_seeker_id: user_id,
                        shift,
                    }));
                    updateTasks.push(jobSeekerModel.setJobShifting(shifts));
                }
                yield Promise.all(updateTasks);
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
    // Add Strie Payout Account
    addStripePayoutAccount(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.jobSeeker;
                const { email, country } = req.body;
                const account = yield stripe_1.stripe.accounts.create({
                    type: "express",
                    country,
                    email,
                    capabilities: {
                        card_payments: { requested: true },
                        transfers: { requested: true },
                    },
                });
                const accountLink = yield stripe_1.stripe.accountLinks.create({
                    account: account.id,
                    refresh_url: "https://tovozo.com/onboarding/refresh", // change as needed
                    return_url: `http://10.10.220.73:9900/api/v1/stripe/onboarding/complete?stripe_acc_id=${account.id}`, // change as needed
                    type: "account_onboarding",
                });
                // await this.Model.UserModel().addStripePayoutAccount({
                // 	user_id,
                // 	stripe_acc_id: account.id,
                // });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { url: accountLink.url },
                };
            }));
        });
    }
}
exports.default = JobSeekerProfileService;
