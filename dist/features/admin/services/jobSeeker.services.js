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
const documentVerificationTemplate_1 = require("../../../utils/templates/documentVerificationTemplate");
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
                const jobSeekerLocationInput = parseInput("own_address");
                if (!files.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "No photo was uploaded. Please add a photo and try again.",
                    };
                }
                for (const { fieldname, filename } of files) {
                    if (fieldname === "photo") {
                        userInput.photo = filename;
                    }
                    else {
                        throw new customError_1.default(this.ResMsg.UNKNOWN_FILE_FIELD, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                }
                // Attach file references
                const { email, phone_number, password } = userInput, restUserData = __rest(userInput, ["email", "phone_number", "password"]);
                const userModel = this.Model.UserModel(trx);
                const jobSeekerModel = this.Model.jobSeekerModel(trx);
                const commonModel = this.Model.commonModel(trx);
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
                let locationId = null;
                if (jobSeekerLocationInput === null || jobSeekerLocationInput === void 0 ? void 0 : jobSeekerLocationInput.address) {
                    let city_id;
                    if (jobSeekerLocationInput.city) {
                        if (!jobSeekerLocationInput.state &&
                            !jobSeekerLocationInput.country) {
                            throw new customError_1.default("state and country required", this.StatusCode.HTTP_BAD_REQUEST);
                        }
                        const checkCountry = yield commonModel.getAllCountry({
                            name: jobSeekerLocationInput.country,
                        });
                        if (!checkCountry.length) {
                            throw new customError_1.default("Service not available in this country", this.StatusCode.HTTP_BAD_REQUEST);
                        }
                        let stateId = 0;
                        const checkState = yield commonModel.getAllStates({
                            country_id: checkCountry[0].id,
                            name: jobSeekerLocationInput.state,
                        });
                        if (!checkState.length) {
                            const state = yield commonModel.createState({
                                country_id: checkCountry[0].id,
                                name: jobSeekerLocationInput.state,
                            });
                            stateId = state[0].id;
                        }
                        else {
                            stateId = checkState[0].id;
                        }
                        const checkCity = yield commonModel.getAllCity({
                            country_id: checkCountry[0].id,
                            state_id: stateId,
                            name: jobSeekerLocationInput.city,
                        });
                        if (!checkCity.length) {
                            const city = yield commonModel.createCity({
                                country_id: checkCountry[0].id,
                                state_id: stateId,
                                name: jobSeekerLocationInput.city,
                            });
                            city_id = city[0].id;
                        }
                        else {
                            city_id = checkCity[0].id;
                        }
                    }
                    const [locationRecord] = yield commonModel.createLocation({
                        city_id,
                        address: jobSeekerLocationInput.address,
                        longitude: jobSeekerLocationInput.longitude,
                        latitude: jobSeekerLocationInput.latitude,
                    });
                    locationId = locationRecord.id;
                }
                yield jobSeekerModel.createJobSeeker(Object.assign(Object.assign({}, jobSeekerInput), { user_id: jobSeekerId, location_id: locationId }));
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
            const { filter, status, limit = 100, skip = 0, from_date, to_date, sortBy, application_status, } = req.query;
            const model = this.Model.jobSeekerModel();
            const data = yield model.getAllJobSeekerList({
                name: filter,
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
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g;
                const user_id = req.admin.user_id;
                const id = req.params.id;
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
                    ownAddress: lib_1.default.safeParseJSON(req.body.own_address) || {},
                };
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "photo":
                            parsed.user.photo = filename;
                            break;
                        case "id_copy":
                            parsed.jobSeeker.id_copy = filename;
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
                    id: id,
                    type: constants_1.USER_TYPE.JOB_SEEKER,
                });
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
                let stateId = 0;
                let city_id = 0;
                if (Object.keys(parsed.ownAddress).length > 0) {
                    if (parsed.ownAddress.city) {
                        if (!parsed.ownAddress.state && !parsed.ownAddress.country) {
                            throw new customError_1.default("state and country required", this.StatusCode.HTTP_BAD_REQUEST);
                        }
                        // check country
                        const checkCountry = yield commonModel.getAllCountry({
                            name: parsed.ownAddress.country,
                        });
                        if (!checkCountry.length) {
                            throw new customError_1.default("Service not available in this country", this.StatusCode.HTTP_BAD_REQUEST);
                        }
                        const checkState = yield commonModel.getAllStates({
                            country_id: checkCountry[0].id,
                            name: parsed.ownAddress.state,
                        });
                        if (!checkState.length) {
                            const state = yield commonModel.createState({
                                country_id: checkCountry[0].id,
                                name: parsed.ownAddress.state,
                            });
                            stateId = state[0].id;
                        }
                        else {
                            stateId = checkState[0].id;
                        }
                        const checkCity = yield commonModel.getAllCity({
                            country_id: checkCountry[0].id,
                            state_id: stateId,
                            name: parsed.ownAddress.city,
                        });
                        if (!checkCity.length) {
                            const city = yield commonModel.createCity({
                                country_id: checkCountry[0].id,
                                state_id: stateId,
                                name: parsed.ownAddress.city,
                            });
                            city_id = city[0].id;
                        }
                        else {
                            city_id = checkCity[0].id;
                        }
                    }
                    let checkLocation;
                    console.log("ll", data.home_location_id);
                    if (data.home_location_id) {
                        checkLocation = yield commonModel.getLocation({
                            location_id: data.home_location_id,
                        });
                        console.log({ checkLocation });
                        if (!checkLocation) {
                            throw new customError_1.default("Location not found!", this.StatusCode.HTTP_NOT_FOUND);
                        }
                        updateTasks.push(commonModel.updateLocation({
                            city_id: (checkLocation === null || checkLocation === void 0 ? void 0 : checkLocation.city_id) || city_id,
                            name: parsed.ownAddress.name,
                            address: parsed.ownAddress.address,
                            longitude: parsed.ownAddress.longitude,
                            latitude: parsed.ownAddress.latitude,
                            postal_code: parsed.ownAddress.postal_code,
                            is_home_address: parsed.ownAddress.is_home_address,
                        }, {
                            location_id: data.home_location_id,
                        }));
                    }
                    else {
                        const [locationRecord] = yield commonModel.createLocation({
                            city_id,
                            name: (_b = parsed.ownAddress) === null || _b === void 0 ? void 0 : _b.name,
                            address: (_c = parsed.ownAddress) === null || _c === void 0 ? void 0 : _c.address,
                            longitude: (_d = parsed.ownAddress) === null || _d === void 0 ? void 0 : _d.longitude,
                            latitude: (_e = parsed.ownAddress) === null || _e === void 0 ? void 0 : _e.latitude,
                            postal_code: (_f = parsed.ownAddress) === null || _f === void 0 ? void 0 : _f.postal_code,
                            is_home_address: (_g = parsed.ownAddress) === null || _g === void 0 ? void 0 : _g.is_home_address,
                        });
                        parsed.jobSeeker.location_id = locationRecord.id;
                    }
                }
                if (Object.keys(parsed.jobSeeker).length > 0) {
                    if (parsed.jobSeeker.account_status) {
                        const checkJobSeeker = yield jobSeekerModel.getJobSeeker({
                            user_id: id,
                        });
                        if (!checkJobSeeker) {
                            throw new customError_1.default("Job Seeker account not found!", this.StatusCode.HTTP_NOT_FOUND);
                        }
                        if (parsed.jobSeeker.account_status === checkJobSeeker.account_status) {
                            throw new customError_1.default(`Already updated status to ${parsed.jobSeeker.account_status}`, this.StatusCode.HTTP_CONFLICT);
                        }
                        if (parsed.jobSeeker.final_completed) {
                            if (!checkJobSeeker.is_completed) {
                                throw new customError_1.default("Job Seeker account not completed!", this.StatusCode.HTTP_CONFLICT);
                            }
                            parsed.jobSeeker.final_completed_at = new Date().toISOString();
                            parsed.jobSeeker.final_completed_by = user_id;
                            yield this.insertNotification(trx, constants_1.USER_TYPE.JOB_SEEKER, {
                                title: "Your account has been completed",
                                content: `Your account has been completed. You can now start applying for jobs.`,
                                related_id: id,
                                sender_type: constants_1.USER_TYPE.ADMIN,
                                sender_id: user_id,
                                user_id: id,
                                type: "JOB_SEEKER_VERIFICATION",
                            });
                        }
                    }
                    updateTasks.push(jobSeekerModel.updateJobSeeker(parsed.jobSeeker, {
                        user_id: id,
                    }));
                }
                // if (parsed.updateJobLocations.length > 0) {
                // 	for (const loc of parsed.updateJobLocations) {
                // 		updateTasks.push(
                // 			commonModel.updateLocation(loc, { location_id: loc.id })
                // 		);
                // 	}
                // }
                yield Promise.all(updateTasks);
                if (parsed.jobSeeker.account_status === constants_1.USER_STATUS.ACTIVE) {
                    yield lib_1.default.sendEmailDefault({
                        email: existingUser.email,
                        emailSub: "Job Seeker Account Activation Successful – You Can Now Log In",
                        emailBody: (0, registrationVerificationCompletedTemplate_1.registrationVerificationCompletedTemplate)(existingUser.name, "tovozo://login"),
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
    verifyJobSeeker(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const adminUserId = req.admin.user_id;
                const jobSeekerId = Number(req.params.id);
                const jobSeekerModel = this.Model.jobSeekerModel(trx);
                const userModel = this.Model.UserModel(trx);
                const jobSeekerData = yield jobSeekerModel.getJobSeekerDetails({
                    user_id: jobSeekerId,
                });
                if (!jobSeekerData) {
                    return {
                        success: false,
                        message: `The requested job seeker account with ID ${jobSeekerId} not found`,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                if (jobSeekerData.final_completed) {
                    return {
                        success: false,
                        message: `The job seeker account with ID ${jobSeekerId} has already been verified and cannot be updated again.`,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                    };
                }
                const [existingUser] = yield userModel.checkUser({
                    id: jobSeekerId,
                    type: constants_1.USER_TYPE.JOB_SEEKER,
                });
                if (!existingUser) {
                    throw new customError_1.default(`The requested user account with ID ${jobSeekerId} not found`, this.StatusCode.HTTP_NOT_FOUND, "ERROR");
                }
                const updateTasks = [];
                updateTasks.push(jobSeekerModel.updateJobSeeker({
                    final_completed: true,
                    final_completed_by: adminUserId,
                    final_completed_at: new Date().toDateString(),
                }, { user_id: jobSeekerId }));
                yield Promise.all(updateTasks);
                yield this.insertNotification(trx, constants_1.USER_TYPE.JOB_SEEKER, {
                    title: "Your documents have been verified",
                    content: `We have successfully verified your submitted documents (ID copy and work permit).  
Your account is now active, and you can start applying for jobs.`,
                    related_id: jobSeekerId,
                    sender_type: constants_1.USER_TYPE.ADMIN,
                    sender_id: adminUserId,
                    user_id: jobSeekerId,
                    type: "JOB_SEEKER_VERIFICATION",
                });
                yield lib_1.default.sendEmailDefault({
                    email: existingUser.email,
                    emailSub: "Your documents have been verified",
                    emailBody: (0, documentVerificationTemplate_1.documentVerificationSuccessTemplate)(existingUser.name),
                });
                yield this.insertAdminAudit(trx, {
                    details: `Job seeker (${existingUser.name} - ${jobSeekerId}) documents have been verified`,
                    created_by: adminUserId,
                    endpoint: req.originalUrl,
                    type: "UPDATE",
                    payload: JSON.stringify({ account_status: constants_1.USER_STATUS.ACTIVE }),
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
