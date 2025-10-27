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
const registrationVerificationCompletedTemplate_1 = require("../../../utils/templates/registrationVerificationCompletedTemplate");
class AdminHotelierService extends abstract_service_1.default {
    createHotelier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.admin;
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const user = lib_1.default.safeParseJSON(req.body.user);
                const organization = lib_1.default.safeParseJSON(req.body.organization);
                const organizationAddress = lib_1.default.safeParseJSON(req.body.organization_address);
                const files = req.files || [];
                for (const file of files) {
                    if (file.fieldname === "photo") {
                        user.photo = file.filename;
                    }
                    if (file.fieldname === "organization_photo") {
                        organization.photo = file.filename;
                    }
                }
                const { email, phone_number, password } = user, userData = __rest(user, ["email", "phone_number", "password"]);
                const userModel = this.Model.UserModel(trx);
                const organizationModel = this.Model.organizationModel(trx);
                const commonModel = this.Model.commonModel(trx);
                const [existingUser] = yield userModel.checkUser({
                    email,
                    phone_number,
                    type: constants_1.USER_TYPE.HOTELIER,
                });
                if (existingUser) {
                    if (existingUser.email === email) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: this.ResMsg.EMAIL_ALREADY_EXISTS,
                        };
                    }
                    if (existingUser.phone_number === phone_number) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS,
                        };
                    }
                }
                const password_hash = yield lib_1.default.hashValue(password);
                const registration = yield userModel.createUser(Object.assign(Object.assign({}, userData), { email,
                    phone_number,
                    password_hash, type: constants_1.USER_TYPE.HOTELIER }));
                if (!registration.length) {
                    throw new customError_1.default(this.ResMsg.HTTP_BAD_REQUEST, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                }
                let stateId = 0;
                let city_id = 0;
                let location_id = null;
                if (Object.keys(organizationAddress).length > 0) {
                    if (organizationAddress.city) {
                        // check country
                        const checkCountry = yield commonModel.getAllCountry({
                            name: organizationAddress.country,
                        });
                        if (!checkCountry.length) {
                            throw new customError_1.default("Service not available in this country", this.StatusCode.HTTP_BAD_REQUEST);
                        }
                        const checkState = yield commonModel.getAllStates({
                            country_id: checkCountry[0].id,
                            name: organizationAddress.state,
                        });
                        if (!checkState.length) {
                            const state = yield commonModel.createState({
                                country_id: checkCountry[0].id,
                                name: organizationAddress.state,
                            });
                            stateId = state[0].id;
                        }
                        else {
                            stateId = checkState[0].id;
                        }
                        const checkCity = yield commonModel.getAllCity({
                            country_id: checkCountry[0].id,
                            state_id: stateId,
                            name: organizationAddress.city,
                        });
                        if (!checkCity.length) {
                            const city = yield commonModel.createCity({
                                country_id: checkCountry[0].id,
                                state_id: stateId,
                                name: organizationAddress.city,
                            });
                            city_id = city[0].id;
                        }
                        else {
                            city_id = checkCity[0].id;
                        }
                    }
                    const [locationRecord] = yield commonModel.createLocation({
                        city_id,
                        name: organizationAddress.name,
                        address: organizationAddress.address,
                        longitude: organizationAddress.longitude,
                        latitude: organizationAddress.latitude,
                        postal_code: organizationAddress.postal_code,
                        is_home_address: organizationAddress.is_home_address,
                    });
                    location_id = locationRecord.id;
                }
                const orgInsert = yield organizationModel.createOrganization({
                    name: organization.org_name,
                    details: organization.details,
                    photo: organization.photo,
                    status: constants_1.USER_STATUS.ACTIVE,
                    user_id: registration[0].id,
                    location_id,
                });
                const tokenData = {
                    user_id: registration[0].id,
                    name: user.name,
                    user_email: email,
                    phone_number,
                    photo: user.photo,
                    status: true,
                    create_date: new Date(),
                };
                yield lib_1.default.sendEmailDefault({
                    email,
                    emailSub: `Hi ${user.name}, your account has been created successfully`,
                    emailBody: (0, registrationVerificationCompletedTemplate_1.registrationFromAdminTemplate)(user.name, {
                        email: user.email,
                        password: user.password,
                    }),
                });
                yield this.insertAdminAudit(trx, {
                    created_by: user_id,
                    details: `Hotelier Account (${user.name}) has been created.`,
                    endpoint: req.originalUrl,
                    type: "CREATE",
                    payload: req.body,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: tokenData,
                };
            }));
        });
    }
    getHoteliers(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, user_id, filter, status, limit = 100, skip = 0, from_date, to_date, } = req.query;
            const model = this.Model.organizationModel();
            const data = yield model.getOrganizationList({
                id: id ? Number(id) : undefined,
                user_id: user_id ? Number(user_id) : undefined,
                name: filter,
                limit,
                skip,
                status,
                from_date,
                to_date,
            });
            return Object.assign({ success: true, message: this.ResMsg.HTTP_OK, code: this.StatusCode.HTTP_OK }, data);
        });
    }
    getSingleHotelier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const organizationModel = this.Model.organizationModel();
            const jobPostModel = this.Model.jobPostModel();
            const data = yield organizationModel.getSingleOrganization(id);
            if (!data) {
                return {
                    success: false,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            // const [organization_amenities, organization_photos] = await Promise.all(
            // 	[
            // 		organizationModel.getAmenities({ organization_id: data.id }),
            // 		organizationModel.getPhotos(data.id),
            // 	]
            // );
            const jobPosts = yield jobPostModel.getJobPostListForHotelier({
                organization_id: data.id,
            });
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign({}, data), { 
                    // organization_amenities,
                    // organization_photos,
                    jobPosts: jobPosts.data }),
            };
        });
    }
    updateHotelier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const model = this.Model.organizationModel(trx);
                const commonModel = this.Model.commonModel(trx);
                const paymentModel = this.Model.paymnentModel(trx);
                const data = yield model.getSingleOrganization(id);
                if (!data) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                const files = req.files;
                const body = req.body;
                const parsed = {
                    organization: lib_1.default.safeParseJSON(body.organization) || {},
                    user: lib_1.default.safeParseJSON(body.user) || {},
                    organization_address: lib_1.default.safeParseJSON(body.organization_address) || {},
                };
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "photo":
                            parsed.user.photo = filename;
                            break;
                        case "organization_photo":
                            parsed.organization.photo = filename;
                            break;
                        default:
                            throw new customError_1.default(this.ResMsg.UNKNOWN_FILE_FIELD, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                }
                const userModel = this.Model.UserModel(trx);
                const [existingUser] = yield userModel.checkUser({
                    id: data.user_id,
                    type: constants_1.USER_TYPE.HOTELIER,
                });
                if (!existingUser) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND, "ERROR");
                }
                if (((_a = parsed === null || parsed === void 0 ? void 0 : parsed.user) === null || _a === void 0 ? void 0 : _a.phone_number) &&
                    parsed.user.phone_number !== existingUser.phone_number) {
                    const phoneExists = yield userModel.checkUser({
                        phone_number: parsed.user.phone_number,
                        type: constants_1.USER_TYPE.HOTELIER,
                    });
                    if (phoneExists.length > 0) {
                        throw new customError_1.default(this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                }
                const updateTasks = [];
                if (Object.keys(parsed.user).length > 0) {
                    updateTasks.push(userModel.updateProfile(parsed.user, { id: data.user_id }));
                }
                if (Object.keys(parsed.organization).length > 0) {
                    if (data.status === "Blocked" &&
                        parsed.organization.status !== "Blocked") {
                        const { data: paymentList } = yield paymentModel.getPaymentsForHotelier({
                            hotelier_id: data.user_id,
                            status: "Unpaid",
                        });
                        if (paymentList.length) {
                            for (const payment of paymentList) {
                                yield paymentModel.updatePayment(payment.id, {
                                    status: constants_1.PAYMENT_STATUS.NOT_PAID,
                                });
                            }
                        }
                        updateTasks.push(model.updateOrganization({
                            name: parsed.organization.name || parsed.organization.org_name,
                            details: parsed.organization.details || data.details,
                            photo: parsed.organization.photo || data.org_photo,
                            status: parsed.organization.status,
                        }, {
                            id: id,
                        }));
                    }
                    else if (data.status !== "Blocked" &&
                        parsed.organization.status === "Blocked") {
                        const { data: jobPostList } = yield this.Model.jobPostModel(trx).getJobPostListForHotelier({
                            organization_id: data.id,
                        });
                        if (jobPostList.length) {
                            const filterableStatuses = ["Pending", "Applied", "In Progress"];
                            const postsToCancel = jobPostList.filter((jobPost) => filterableStatuses.includes(jobPost.job_post_details_status));
                            for (const jobPost of postsToCancel) {
                                yield this.Model.jobPostModel(trx).updateJobPostDetailsStatus({
                                    id: jobPost.id,
                                    status: constants_1.JOB_POST_DETAILS_STATUS.Cancelled,
                                });
                            }
                        }
                        updateTasks.push(model.updateOrganization({
                            name: parsed.organization.name || parsed.organization.org_name,
                            details: parsed.organization.details || data.details,
                            photo: parsed.organization.photo || data.org_photo,
                            status: parsed.organization.status,
                        }, {
                            id: id,
                        }));
                    }
                    else {
                        updateTasks.push(model.updateOrganization({
                            name: parsed.organization.name || parsed.organization.org_name,
                            details: parsed.organization.details || data.details,
                            photo: parsed.organization.photo || data.org_photo,
                            status: parsed.organization.status || data.status,
                        }, {
                            id: id,
                        }));
                    }
                }
                yield Promise.all(updateTasks);
                if (parsed.organization.status === constants_1.USER_STATUS.ACTIVE) {
                    if (data.status === parsed.organization.status) {
                        throw new customError_1.default(`Already updated status to ${parsed.organization.status}`, this.StatusCode.HTTP_CONFLICT);
                    }
                    yield lib_1.default.sendEmailDefault({
                        email: existingUser.email,
                        emailSub: "Hotelier Account Activation Successful – You Can Now Log In",
                        emailBody: (0, registrationVerificationCompletedTemplate_1.registrationVerificationCompletedTemplate)(existingUser.name, "tovozo://login"),
                    });
                }
                let stateId = 0;
                let city_id = 0;
                if (Object.keys(parsed.organization_address).length > 0) {
                    if (parsed.organization_address.city) {
                        // check country
                        const checkCountry = yield commonModel.getAllCountry({
                            name: parsed.organization_address.country,
                        });
                        if (!checkCountry.length) {
                            throw new customError_1.default("Service not available in this country", this.StatusCode.HTTP_BAD_REQUEST);
                        }
                        const checkState = yield commonModel.getAllStates({
                            country_id: checkCountry[0].id,
                            name: parsed.organization_address.state,
                        });
                        if (!checkState.length) {
                            const state = yield commonModel.createState({
                                country_id: checkCountry[0].id,
                                name: parsed.organization_address.state,
                            });
                            stateId = state[0].id;
                        }
                        else {
                            stateId = checkState[0].id;
                        }
                        const checkCity = yield commonModel.getAllCity({
                            country_id: checkCountry[0].id,
                            state_id: stateId,
                            name: parsed.organization_address.city,
                        });
                        if (!checkCity.length) {
                            const city = yield commonModel.createCity({
                                country_id: checkCountry[0].id,
                                state_id: stateId,
                                name: parsed.organization_address.city,
                            });
                            city_id = city[0].id;
                        }
                        else {
                            city_id = checkCity[0].id;
                        }
                    }
                    if (data.location_id) {
                        const checkLocation = yield commonModel.getLocation({
                            location_id: data.location_id,
                        });
                        if (!checkLocation) {
                            throw new customError_1.default("Location not found!", this.StatusCode.HTTP_NOT_FOUND);
                        }
                        updateTasks.push(commonModel.updateLocation({
                            city_id: checkLocation.city_id,
                            name: parsed.organization_address.name,
                            address: parsed.organization_address.address,
                            longitude: parsed.organization_address.longitude,
                            latitude: parsed.organization_address.latitude,
                            postal_code: parsed.organization_address.postal_code,
                            is_home_address: parsed.organization_address.is_home_address,
                        }, {
                            location_id: data.location_id,
                        }));
                    }
                    else {
                        updateTasks.push((() => __awaiter(this, void 0, void 0, function* () {
                            const [locationRecord] = yield commonModel.createLocation({
                                city_id,
                                name: parsed.organization_address.name,
                                address: parsed.organization_address.address,
                                longitude: parsed.organization_address.longitude,
                                latitude: parsed.organization_address.latitude,
                                postal_code: parsed.organization_address.postal_code,
                                is_home_address: parsed.organization_address.is_home_address,
                            });
                            parsed.organization.location_id = locationRecord.id;
                        }))());
                    }
                }
                yield this.insertAdminAudit(trx, {
                    details: `Hotelier (${existingUser.name} - ${data.user_id}) profile has been updated.`,
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
    deleteHotelier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.organizationModel(trx);
                const data = yield model.getSingleOrganization(id);
                if (!data) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                const userModel = this.Model.UserModel(trx);
                yield userModel.deleteUser(data.user_id);
                yield model.deleteOrganization({ id: data.id });
                yield this.insertAdminAudit(trx, {
                    details: `Hotelier (${data.name} - ${data.user_id}) has been deleted.`,
                    created_by: req.admin.user_id,
                    endpoint: req.originalUrl,
                    type: "DELETE",
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: `Hotelier (${data.name} - ${data.user_id}) has been deleted successfully.`,
                };
            }));
        });
    }
}
exports.default = AdminHotelierService;
