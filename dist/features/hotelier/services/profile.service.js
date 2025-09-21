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
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const model = this.Model.organizationModel(trx);
                const commonModel = this.Model.commonModel(trx);
                const userModel = this.Model.UserModel(trx);
                const existingOrganization = yield model.getOrganization({
                    user_id,
                });
                if (!existingOrganization) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND, "ERROR");
                }
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
                    user: lib_1.default.safeParseJSON(body.user) || {},
                    organization: lib_1.default.safeParseJSON(body.organization) || {},
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
                    updateTasks.push(model.updateOrganization({
                        name: parsed.organization.name || data.name,
                        details: parsed.organization.details || data.details,
                        photo: parsed.organization.photo || data.photo,
                    }, {
                        id: existingOrganization.id,
                    }));
                }
                if (parsed.organization.status === constants_1.USER_STATUS.ACTIVE) {
                    if (data.status === parsed.organization.status) {
                        throw new customError_1.default(`Already updated status to ${parsed.organization.status}`, this.StatusCode.HTTP_CONFLICT);
                    }
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
                                is_home_address: parsed.organization_address
                                    .is_home_address,
                            });
                            parsed.organization.location_id = locationRecord.id;
                        }))());
                    }
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
}
exports.default = HotelierProfileService;
