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
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const commonModelTypes_1 = require("../../../utils/modelTypes/common/commonModelTypes");
const userModelTypes_1 = require("../../../utils/modelTypes/user/userModelTypes");
class JobSeekerProfileService extends abstract_service_1.default {
    constructor() {
        super();
        // get profile
        this.getProfile = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const jobSeekerModel = this.Model.jobSeekerModel();
            const _a = yield jobSeekerModel.getJobSeekerDetails({
                user_id,
            }), { applied_jobs } = _a, rest = __rest(_a, ["applied_jobs"]);
            const isWaitingForApproval = applied_jobs === null || applied_jobs === void 0 ? void 0 : applied_jobs.filter((job) => job.application_status ===
                constants_1.JOB_APPLICATION_STATUS.WaitingForApproval);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, rest), { is_waiting_for_approval: isWaitingForApproval.length > 0, applied_jobs }),
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
                    ownAddress: lib_1.default.safeParseJSON(req.body.own_address) || {},
                    bank_details: lib_1.default.safeParseJSON(req.body.bank_details) || {},
                };
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "photo":
                            parsed.user.photo = filename;
                            break;
                        case "id_copy":
                            parsed.jobSeeker.id_copy = filename;
                            break;
                        case "work_permit":
                            parsed.jobSeeker.work_permit = filename;
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
                    parsed.user.phone_number === existingUser.phone_number) {
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
                yield Promise.all(updateTasks);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    // update User Verification Details
    updateUserVerificationDetails(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const files = req.files || [];
                const { user_id } = req.jobSeeker;
                const parsed = {
                    jobSeeker: lib_1.default.safeParseJSON(req.body.job_seeker) || {},
                    bank_details: lib_1.default.safeParseJSON(req.body.bank_details) || {},
                };
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "id_copy":
                            parsed.jobSeeker.id_copy = filename;
                            break;
                        case "work_permit":
                            parsed.jobSeeker.work_permit = filename;
                            break;
                        default:
                            throw new customError_1.default(this.ResMsg.UNKNOWN_FILE_FIELD, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                }
                if (!parsed.jobSeeker.id_copy) {
                    throw new customError_1.default("ID Copy file is required", this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                }
                if (!parsed.jobSeeker.work_permit) {
                    throw new customError_1.default("Work Permit file is required", this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                }
                const userModel = this.Model.UserModel(trx);
                const jobSeekerModel = this.Model.jobSeekerModel(trx);
                const [existingUser] = yield userModel.checkUser({
                    id: user_id,
                    type: constants_1.USER_TYPE.JOB_SEEKER,
                });
                if (!existingUser) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND, "ERROR");
                }
                const updateTasks = [];
                if (parsed.jobSeeker && Object.keys(parsed.jobSeeker).length > 0) {
                    updateTasks.push(jobSeekerModel.updateJobSeeker(Object.assign({ is_completed: true, completed_at: new Date() }, parsed.jobSeeker), {
                        user_id,
                    }));
                }
                const accountNumber = String(parsed.bank_details.account_number).trim();
                const isAccountExists = yield jobSeekerModel.getBankAccounts({
                    user_id,
                    account_number: accountNumber,
                });
                console.log({ isAccountExists });
                if (isAccountExists.length > 0) {
                    throw new customError_1.default("Same Bank account already exists for this user", this.StatusCode.HTTP_BAD_REQUEST);
                }
                if (parsed.bank_details &&
                    Object.keys(parsed.bank_details).length > 0) {
                    const existingAccounts = yield jobSeekerModel.getBankAccounts({
                        user_id,
                    });
                    if (existingAccounts.length === 0) {
                        parsed.bank_details.is_primary = true;
                    }
                    else if (parsed.bank_details.is_primary !== undefined &&
                        parsed.bank_details.is_primary !== false) {
                        const isPrimaryAccountExists = existingAccounts.filter((acc) => acc.is_primary);
                        if (isPrimaryAccountExists.length > 0) {
                            throw new customError_1.default("Primary bank details already added for this user", this.StatusCode.HTTP_BAD_REQUEST);
                        }
                    }
                    updateTasks.push(jobSeekerModel.addBankDetails(Object.assign({ job_seeker_id: user_id }, parsed.bank_details)));
                }
                yield Promise.all(updateTasks);
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.ADMIN, {
                    user_id,
                    sender_type: constants_1.USER_TYPE.ADMIN,
                    title: this.NotificationMsg.VERIFICATION_SUBMITTED.title,
                    content: this.NotificationMsg.VERIFICATION_SUBMITTED.content({
                        name: existingUser.name,
                    }),
                    related_id: user_id,
                    type: commonModelTypes_1.NotificationTypeEnum.JOB_SEEKER_VERIFICATION,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    // make account primary
    markAccountAsPrimary(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params; // bank_details id
            const { user_id } = req.jobSeeker;
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobseekerModel = this.Model.jobSeekerModel(trx);
                const allBanks = yield jobseekerModel.getBankAccounts({ user_id });
                if (!allBanks || allBanks.length === 0) {
                    throw new customError_1.default("No bank accounts found for this user", this.StatusCode.HTTP_NOT_FOUND);
                }
                const requestedBank = allBanks.find((b) => b.id === Number(id));
                if (!requestedBank) {
                    throw new customError_1.default("Requested bank account not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                const updatePromises = allBanks.map((b) => jobseekerModel.markAsPrimaryBank({ id: b.id }, { is_primary: b.id === Number(id) }));
                yield Promise.all(updatePromises);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Bank account marked as primary",
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
