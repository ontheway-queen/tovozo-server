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
class HotelierProfileService extends abstract_service_1.default {
    constructor() {
        super();
        // get profile
        this.getProfile = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.hotelier;
            const userModel = this.Model.UserModel();
            const _a = yield userModel.getSingleCommonAuthUser({
                table_name: constants_1.USER_AUTHENTICATION_VIEW.HOTELIER,
                schema_name: "hotelier",
                user_id,
            }), { password_hash } = _a, rest = __rest(_a, ["password_hash"]);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign({}, rest),
            };
        });
    }
    //change password
    changePassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.hotelier;
            const { old_password, new_password } = req.body;
            const model = this.Model.UserModel();
            const user_details = yield model.getSingleCommonAuthUser({
                schema_name: "hotelier",
                table_name: constants_1.USER_AUTHENTICATION_VIEW.HOTELIER,
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
    // update profile
    updateHotelier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.hotelier;
            const id = req.params.id;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const model = this.Model.organizationModel(trx);
                const commonModel = this.Model.commonModel(trx);
                const userModel = this.Model.UserModel(trx);
                const [existingUser] = yield userModel.checkUser({
                    id: user_id,
                    type: constants_1.USER_TYPE.HOTELIER,
                });
                if (!existingUser) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND, "ERROR");
                }
                const data = yield model.getOrganization({ user_id });
                if (!data) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                const files = req.files;
                const body = req.body;
                const parsed = {
                    organization: lib_1.default.safeParseJSON(body.organization) || {},
                    user: lib_1.default.safeParseJSON(body.user) || {},
                    addPhoto: lib_1.default.safeParseJSON(body.add_photo) || [],
                    deletePhoto: lib_1.default.safeParseJSON(body.delete_photo) || [],
                    addAmenities: lib_1.default.safeParseJSON(body.add_amenities) || [],
                    updateAmenities: lib_1.default.safeParseJSON(body.update_amenities) || {},
                    deleteAmenities: lib_1.default.safeParseJSON(body.delete_amenities) || [],
                    organization_address: lib_1.default.safeParseJSON(body.organization_address) || {},
                };
                for (const { fieldname, filename } of files) {
                    switch (fieldname) {
                        case "photo":
                            parsed.user.photo = filename;
                            break;
                        case "hotel_photo":
                            parsed.addPhoto.push({
                                file: filename,
                                organization_id: id,
                            });
                            break;
                        default:
                            throw new customError_1.default(this.ResMsg.UNKNOWN_FILE_FIELD, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
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
                    if (parsed.organization.status) {
                        const checkHotelier = yield model.getSingleOrganization(id);
                        if (!checkHotelier) {
                            throw new customError_1.default("Hotelier account not found!", this.StatusCode.HTTP_NOT_FOUND);
                        }
                        if (parsed.organization.status === checkHotelier.status) {
                            throw new customError_1.default(`Already updated status to ${parsed.organization.status}`, this.StatusCode.HTTP_CONFLICT);
                        }
                    }
                    updateTasks.push(model.updateOrganization({
                        name: parsed.organization.org_name || data.org_name,
                        status: parsed.organization.status || data.status,
                    }, {
                        id: id,
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
                    if (data.status === parsed.organization.status) {
                        throw new customError_1.default(`Already updated status to ${parsed.organization.status}`, this.StatusCode.HTTP_CONFLICT);
                    }
                    yield lib_1.default.sendEmailDefault({
                        email: existingUser.email,
                        emailSub: "Hotelier Account Activation Successful – You Can Now Log In",
                        emailBody: (0, registrationVerificationCompletedTemplate_1.registrationVerificationCompletedTemplate)(existingUser.name, "tovozo://login"),
                    });
                }
                if (Object.keys(parsed.organization_address).length > 0) {
                    if (parsed.organization_address.city_id) {
                        const checkCity = yield commonModel.getAllCity({
                            city_id: parsed.organization_address.city_id,
                        });
                        if (!checkCity.length) {
                            throw new customError_1.default("City not found!", this.StatusCode.HTTP_NOT_FOUND);
                        }
                    }
                    if (parsed.organization_address.id) {
                        const checkLocation = yield commonModel.getLocation({
                            location_id: parsed.organization_address.id,
                        });
                        if (!checkLocation) {
                            throw new customError_1.default("Location not found!", this.StatusCode.HTTP_NOT_FOUND);
                        }
                        updateTasks.push(commonModel.updateLocation(parsed.organization_address, {
                            location_id: parsed.organization_address.id,
                        }));
                    }
                    else {
                        updateTasks.push(commonModel.createLocation(parsed.organization_address));
                    }
                }
                // await this.insertAdminAudit(trx, {
                // 	details: `Hotelier (${existingUser.name} - ${data.user_id}) profile has been updated.`,
                // 	created_by: req.admin.user_id,
                // 	endpoint: req.originalUrl,
                // 	type: "UPDATE",
                // 	payload: JSON.stringify(parsed),
                // });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.default = HotelierProfileService;
