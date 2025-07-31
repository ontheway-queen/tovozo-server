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
const registrationVerificationCompletedTemplate_1 = require("../../../utils/templates/registrationVerificationCompletedTemplate");
class AdminJobSeekerService extends abstract_service_1.default {
    createJobSeeker(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const files = req.files || [];
                const parseInput = (key) => lib_1.default.safeParseJSON(req.body[key]) || {};
                const userInput = parseInput("user");
                const jobSeekerInput = parseInput("job_seeker");
                const jobSeekerInfoInput = parseInput("job_seeker_info");
                // Attach file references
                let idCopyFound = false;
                for (const { fieldname, filename } of files) {
                    if (fieldname === "photo") {
                        userInput.photo = filename;
                        continue;
                    }
                    if (jobSeekerInput.nationality === constants_1.BRITISH_ID) {
                        if (fieldname === "id_copy") {
                            idCopyFound = true;
                        }
                        else if (fieldname !== "passport_copy") {
                            throw new customError_1.default("Only id_copy is allowed for British nationality", this.StatusCode.HTTP_BAD_REQUEST);
                        }
                    }
                    else {
                        if (fieldname !== "visa_copy") {
                            throw new customError_1.default("Only visa_copy required for Non-British Nationality", this.StatusCode.HTTP_BAD_REQUEST);
                        }
                    }
                    jobSeekerInfoInput[fieldname] = filename;
                }
                if (jobSeekerInput.nationality === constants_1.BRITISH_ID && !idCopyFound) {
                    throw new customError_1.default("id_copy is required for British Nationality", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const { email, phone_number, password } = userInput, restUserData = __rest(userInput, ["email", "phone_number", "password"]);
                const userModel = this.Model.UserModel(trx);
                const jobSeekerModel = this.Model.jobSeekerModel(trx);
                const existingUser = yield userModel.checkUser({
                    email,
                    phone_number,
                    type: constants_1.USER_TYPE.JOB_SEEKER,
                });
                if (existingUser && existingUser.length) {
                    for (const user of existingUser) {
                        if (user.email === email) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: this.ResMsg.EMAIL_ALREADY_EXISTS,
                            };
                        }
                        if (user.phone_number === phone_number) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS,
                            };
                        }
                    }
                }
                const password_hash = yield lib_1.default.hashValue(password);
                const registration = yield userModel.createUser(Object.assign(Object.assign({}, restUserData), { email,
                    phone_number,
                    password_hash, type: constants_1.USER_TYPE.JOB_SEEKER }));
                if (!registration.length) {
                    throw new customError_1.default(this.ResMsg.HTTP_BAD_REQUEST, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                }
                const jobSeekerId = registration[0].id;
                yield jobSeekerModel.createJobSeeker(Object.assign(Object.assign({}, jobSeekerInput), { user_id: jobSeekerId }));
                yield jobSeekerModel.createJobSeekerInfo(Object.assign(Object.assign({}, jobSeekerInfoInput), { job_seeker_id: jobSeekerId }));
                const tokenPayload = {
                    user_id: jobSeekerId,
                    name: userInput.name,
                    gender: userInput.gender,
                    user_email: email,
                    phone_number,
                    photo: userInput.photo,
                    status: true,
                    create_date: new Date(),
                };
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.ADMIN, {
                    user_id: jobSeekerId,
                    sender_type: constants_1.USER_TYPE.ADMIN,
                    title: this.NotificationMsg.JOB_SEEKER_ACCOUNT_CREATED.title,
                    content: this.NotificationMsg.JOB_SEEKER_ACCOUNT_CREATED.content(userInput.name),
                    related_id: jobSeekerId,
                    type: commonModelTypes_1.NotificationTypeEnum.JOB_SEEKER_VERIFICATION,
                });
                yield this.insertAdminAudit(trx, {
                    created_by: user_id,
                    details: `A job seeker account (${userInput.name}) has been created.`,
                    endpoint: req.originalUrl,
                    type: "CREATE",
                    payload: JSON.stringify(parseInput),
                });
                yield lib_1.default.sendEmailDefault({
                    email,
                    emailSub: `Hi ${userInput.name}, your account has been created successfully`,
                    emailBody: (0, registrationVerificationCompletedTemplate_1.registrationFromAdminTemplate)(userInput.name, {
                        email: userInput.email,
                        password: userInput.password,
                    }),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: tokenPayload,
                };
            }));
        });
    }
    getJobSeekers(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, status, limit = 100, skip = 0, from_date, to_date, sortBy, application_status, } = req.query;
            const model = this.Model.jobSeekerModel();
            const data = yield model.getAllJobSeekerList({
                name,
                limit,
                skip,
                status,
                from_date,
                to_date,
                sortBy,
                application_status,
            });
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
                    message: `The requested job seeker account with ID ${id} not found`,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign({}, data),
            };
        });
    }
    updateJobSeeker(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const model = this.Model.jobSeekerModel(trx);
                const data = yield model.getJobSeekerDetails({ user_id: id });
                if (!data) {
                    return {
                        success: false,
                        message: `The requested job seeker account with ID ${id} not found`,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                const files = req.files;
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
                        case "visa_copy":
                            parsed.jobSeekerInfo.visa_copy = filename;
                            break;
                        case "id_copy":
                            parsed.jobSeekerInfo.id_copy = filename;
                            break;
                        case "passport_copy":
                            parsed.jobSeekerInfo.passport_copy = filename;
                            break;
                        default:
                            throw new customError_1.default(this.ResMsg.UNKNOWN_FILE_FIELD, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                }
                const userModel = this.Model.UserModel(trx);
                const jobSeekerModel = this.Model.jobSeekerModel(trx);
                const commonModel = this.Model.commonModel(trx);
                const [existingUser] = yield userModel.checkUser({
                    id: id,
                    type: constants_1.USER_TYPE.JOB_SEEKER,
                });
                console.log({ existingUser });
                if (!existingUser) {
                    throw new customError_1.default(`The requested job seeker account with ID ${id} not found`, this.StatusCode.HTTP_NOT_FOUND, "ERROR");
                }
                if (((_a = parsed === null || parsed === void 0 ? void 0 : parsed.user) === null || _a === void 0 ? void 0 : _a.phone_number) &&
                    parsed.user.phone_number !== existingUser.phone_number) {
                    const phoneExists = yield userModel.checkUser({
                        phone_number: parsed.user.phone_number,
                        type: constants_1.USER_TYPE.JOB_SEEKER,
                    });
                    if (phoneExists.length) {
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
                    if (parsed.jobSeeker.account_status) {
                        const checkJobSeeker = yield jobSeekerModel.getJobSeeker({
                            user_id: id,
                        });
                        if (!checkJobSeeker) {
                            throw new customError_1.default("Job Seeker account not found!", this.StatusCode.HTTP_NOT_FOUND);
                        }
                        if (parsed.jobSeeker.account_status ===
                            checkJobSeeker.account_status) {
                            throw new customError_1.default(`Already updated status to ${parsed.jobSeeker.account_status}`, this.StatusCode.HTTP_CONFLICT);
                        }
                    }
                    updateTasks.push(jobSeekerModel.updateJobSeeker(parsed.jobSeeker, {
                        user_id: id,
                    }));
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
                if (parsed.jobSeeker.account_status === constants_1.USER_STATUS.ACTIVE) {
                    yield lib_1.default.sendEmailDefault({
                        email: existingUser.email,
                        emailSub: "Job Seeker Account Activation Successful – You Can Now Log In",
                        emailBody: (0, registrationVerificationCompletedTemplate_1.registrationVerificationCompletedTemplate)(existingUser.name, "Trabill OTA B2B://login"),
                    });
                }
                yield this.insertAdminAudit(trx, {
                    details: `Job seeker (${existingUser.name} - ${id}) profile has been updated.`,
                    created_by: req.admin.user_id,
                    endpoint: req.originalUrl,
                    type: "UPDATE",
                    payload: JSON.stringify(parsed),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    deleteJobSeeker(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.jobSeekerModel();
                const data = yield model.getJobSeekerDetails({ user_id: id });
                if (!data) {
                    return {
                        success: false,
                        message: `The requested job seeker account with ID ${id} not found`,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                const userModel = this.Model.UserModel(trx);
                yield userModel.deleteUser(id);
                yield this.insertAdminAudit(trx, {
                    details: `Job seeker (${data.name} - ${id}) has been deleted.`,
                    created_by: req.admin.user_id,
                    endpoint: req.originalUrl,
                    type: "DELETE",
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: `Job seeker (${data.name} - ${id}) has been deleted successfully.`,
                };
            }));
        });
    }
    getNearestJobSeekers(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobSeeker = this.Model.jobSeekerModel();
            const { lat, lon, name } = req.query;
            const orgLat = parseFloat(lat);
            const orgLng = parseFloat(lon);
            const all = yield jobSeeker.getJobSeekerLocation({
                name: name,
            });
            const nearbySeekers = [];
            for (const seeker of all) {
                const seekerLat = parseFloat(seeker.latitude);
                const seekerLng = parseFloat(seeker.longitude);
                const distance = lib_1.default.getDistanceFromLatLng(orgLat, orgLng, seekerLat, seekerLng);
                console.log({ seeker });
                if (distance <= 10) {
                    nearbySeekers.push({
                        id: seeker.user_id,
                        name: seeker.name,
                    });
                }
            }
            return {
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: nearbySeekers,
            };
        });
    }
}
exports.default = AdminJobSeekerService;
