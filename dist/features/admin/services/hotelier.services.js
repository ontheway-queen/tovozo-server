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
                const files = req.files || [];
                console.log({ user: req.body });
                const _a = lib_1.default.safeParseJSON(req.body.user), { designation } = _a, user = __rest(_a, ["designation"]);
                const organization = lib_1.default.safeParseJSON(req.body.organization);
                const organizationAddress = lib_1.default.safeParseJSON(req.body.organization_address);
                const amenitiesInput = lib_1.default.safeParseJSON(req.body.organization_amenities) || [];
                for (const file of files) {
                    if (file.fieldname === "photo") {
                        user.photo = file.filename;
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
                const organization_location = yield commonModel.createLocation(organizationAddress);
                const locationId = organization_location[0].id;
                const userId = registration[0].id;
                yield userModel.createUserMaintenanceDesignation({
                    designation,
                    user_id: userId,
                });
                const orgInsert = yield organizationModel.createOrganization(Object.assign(Object.assign({}, organization), { status: constants_1.USER_STATUS.ACTIVE, user_id: userId, location_id: locationId }));
                const organizationId = orgInsert[0].id;
                const photos = files.map((file) => ({
                    organization_id: organizationId,
                    file: file.filename,
                }));
                if (photos.length) {
                    yield organizationModel.addPhoto(photos);
                }
                const amenities = amenitiesInput.map((a) => ({
                    organization_id: organizationId,
                    amenity: a,
                }));
                if (amenities.length) {
                    yield organizationModel.addAmenities(amenities);
                }
                const tokenData = {
                    user_id: userId,
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
            const { id, user_id, name, status, limit = 100, skip = 0, from_date, to_date, } = req.query;
            const model = this.Model.organizationModel();
            const data = yield model.getOrganizationList({
                id: id ? Number(id) : undefined,
                user_id: user_id ? Number(user_id) : undefined,
                name,
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
            const [organization_amenities, organization_photos] = yield Promise.all([
                organizationModel.getAmenities({ organization_id: data.id }),
                organizationModel.getPhotos(data.id),
            ]);
            const jobPosts = yield jobPostModel.getHotelierJobPostList({
                organization_id: data.id,
            });
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign({}, data), { organization_amenities,
                    organization_photos, jobPosts: jobPosts.data }),
            };
        });
    }
    updateHotelier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const model = this.Model.organizationModel(trx);
                const data = yield model.getSingleOrganization(id);
                console.log({ data });
                if (!data) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                const files = req.files;
                const parsed = {
                    organization: lib_1.default.safeParseJSON(req.body.organization) || {},
                    user: lib_1.default.safeParseJSON(req.body.user) || {},
                    addPhoto: lib_1.default.safeParseJSON(req.body.add_photo) || [],
                    deletePhoto: lib_1.default.safeParseJSON(req.body.delete_photo) || [],
                    addAmenities: lib_1.default.safeParseJSON(req.body.add_amenities) || [],
                    updateAmenities: lib_1.default.safeParseJSON(req.body.update_amenities) || {},
                    deleteAmenities: lib_1.default.safeParseJSON(req.body.delete_amenities) || [],
                };
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "profile_photo":
                            parsed.user.photo = filename;
                            break;
                        case "photo":
                            parsed.addPhoto.push({
                                file: filename,
                                organization_id: id,
                            });
                            break;
                        default:
                            throw new customError_1.default(this.ResMsg.UNKNOWN_FILE_FIELD, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                }
                const userModel = this.Model.UserModel(trx);
                const [existingUser] = yield userModel.checkUser({
                    id: id,
                    type: constants_1.USER_TYPE.HOTELIER,
                });
                console.log({ existingUser });
                if (!existingUser) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND, "ERROR");
                }
                if (((_a = parsed === null || parsed === void 0 ? void 0 : parsed.user) === null || _a === void 0 ? void 0 : _a.phone_number) &&
                    parsed.user.phone_number !== existingUser.phone_number) {
                    const phoneExists = yield userModel.checkUser({
                        phone_number: parsed.user.phone_number,
                        type: constants_1.USER_TYPE.HOTELIER,
                    });
                    if (phoneExists) {
                        throw new customError_1.default(this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                }
                const updateTasks = [];
                if (Object.keys(parsed.user).length > 0) {
                    updateTasks.push(userModel.updateProfile(parsed.user, { id: data.user_id }));
                }
                if (Object.keys(parsed.organization).length > 0) {
                    if (parsed.organization.status) {
                        const checkHotelier = yield model.getSingleOrganization(id);
                        if (!checkHotelier) {
                            throw new customError_1.default("Hotelier account not found!", this.StatusCode.HTTP_NOT_FOUND);
                        }
                        if (parsed.organization.status === checkHotelier.status) {
                            throw new customError_1.default(`Already updated status to ${parsed.organization.status}`, this.StatusCode.HTTP_CONFLICT);
                        }
                    }
                    updateTasks.push(model.updateOrganization(parsed.organization, {
                        user_id: id,
                    }));
                }
                if (parsed.addPhoto.length > 0) {
                    updateTasks.push(model.addPhoto(parsed.addPhoto));
                }
                if (parsed.deletePhoto.length > 0) {
                    for (const delP of parsed.deletePhoto) {
                        updateTasks.push(model.deletePhoto(Number(delP)));
                    }
                }
                if (parsed.addAmenities.length > 0) {
                    const amenitiesPayload = [];
                    for (const amenity of parsed.addAmenities) {
                        amenitiesPayload.push({ amenity, organization_id: id });
                    }
                    updateTasks.push(model.addAmenities(amenitiesPayload));
                }
                if (Object.keys(parsed.updateAmenities).length) {
                    const checkUpdateAmenity = yield model.getAmenities({
                        organization_id: id,
                        id: parsed.updateAmenities.id,
                    });
                    if (!checkUpdateAmenity.length) {
                        throw new customError_1.default("Update amenity not found!", this.StatusCode.HTTP_NOT_FOUND);
                    }
                    updateTasks.push(model.updateAmenities(parsed.updateAmenities.amenity, parsed.updateAmenities.id));
                }
                if (parsed.deleteAmenities.length > 0) {
                    const checkAmenities = yield model.getAmenities({
                        organization_id: id,
                    });
                    if (!checkAmenities.length) {
                        throw new customError_1.default("Amenity not found!", this.StatusCode.HTTP_NOT_FOUND);
                    }
                    updateTasks.push(model.deleteAmenities({
                        organization_id: id,
                        ids: parsed.deleteAmenities,
                    }));
                }
                yield Promise.all(updateTasks);
                if (parsed.organization.status === constants_1.USER_STATUS.ACTIVE) {
                    yield lib_1.default.sendEmailDefault({
                        email: existingUser.email,
                        emailSub: "Hotelier Account Activation Successful – You Can Now Log In",
                        emailBody: (0, registrationVerificationCompletedTemplate_1.registrationVerificationCompletedTemplate)(existingUser.name, "Trabill OTA B2B://login"),
                    });
                    // await this.insertNotification(trx, TypeUser.HOTELIER, {
                    //   user_id: id,
                    //   content: `Your account has been updated to ${parsed.hotelier.status}`,
                    //   related_id: id,
                    //   type: "HOTELIER_VERIFICATION",
                    // });
                }
                yield this.insertAdminAudit(trx, {
                    details: `Hotelier (${existingUser.name} - ${id}) profile has been updated.`,
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
