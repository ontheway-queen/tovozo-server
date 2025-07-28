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
const config_1 = __importDefault(require("../../../app/config"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const commonModelTypes_1 = require("../../../utils/modelTypes/common/commonModelTypes");
const userModelTypes_1 = require("../../../utils/modelTypes/user/userModelTypes");
const registrationHotelierTemplate_1 = require("../../../utils/templates/registrationHotelierTemplate");
class HotelierAuthService extends abstract_service_1.default {
    constructor() {
        super();
    }
    organizationRegistrationService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const files = req.files || [];
                const body = req.body;
                const _a = lib_1.default.safeParseJSON(body.user), { designation } = _a, user = __rest(_a, ["designation"]);
                const organization = lib_1.default.safeParseJSON(body.organization);
                const organizationAddress = lib_1.default.safeParseJSON(body.organization_address);
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
                const orgInsert = yield organizationModel.createOrganization({
                    name: organization.org_name,
                    user_id: userId,
                    location_id: locationId,
                });
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
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.ADMIN, {
                    user_id: userId,
                    content: `New hotelier "${user.name}" has registered and is awaiting verification.`,
                    related_id: userId,
                    type: commonModelTypes_1.NotificationTypeEnum.HOTELIER_VERIFICATION,
                });
                //   throw Error("Registration failed");
                yield lib_1.default.sendEmailDefault({
                    email,
                    emailSub: `Your organization registration with ${constants_1.PROJECT_NAME} is under review`,
                    emailBody: (0, registrationHotelierTemplate_1.registrationHotelierTemplate)({ name: user.name }),
                });
                const token = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_HOTEL, constants_1.LOGIN_TOKEN_EXPIRES_IN);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: tokenData,
                    token,
                };
            }));
        });
    }
    // login
    loginService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const userModel = this.Model.UserModel();
            const checkUser = yield userModel.getSingleCommonAuthUser({
                schema_name: "hotelier",
                table_name: constants_1.USER_AUTHENTICATION_VIEW.HOTELIER,
                email,
            });
            if (!checkUser) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "No user found with this credentials!",
                };
            }
            const { password_hash: hashPass } = checkUser, rest = __rest(checkUser, ["password_hash"]);
            const checkPass = yield lib_1.default.compareHashValue(password, hashPass);
            if (!checkPass) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.WRONG_CREDENTIALS,
                };
            }
            console.log(rest.organization_status);
            console.log(constants_1.USER_STATUS.ACTIVE);
            if (rest.organization_status.toLowerCase() !==
                constants_1.USER_STATUS.ACTIVE.toLowerCase()) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_FORBIDDEN,
                    message: `Account Inactive: Your account status is '${rest.organization_status}'. Please contact ${constants_1.PROJECT_NAME} support to activate your account.`,
                };
            }
            if (rest.is_2fa_on) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.LOGIN_SUCCESSFUL,
                    data: {
                        email: rest.email,
                        is_2fa_on: true,
                    },
                };
            }
            else {
                const token_data = {
                    user_id: rest.user_id,
                    name: rest.name,
                    phone_number: rest.phone_number,
                    photo: rest.photo,
                    status: rest.user_status,
                    email: rest.email,
                    organization_status: rest.organization_status,
                };
                const token = lib_1.default.createToken(token_data, config_1.default.JWT_SECRET_HOTEL, constants_1.LOGIN_TOKEN_EXPIRES_IN);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.LOGIN_SUCCESSFUL,
                    data: rest,
                    token,
                };
            }
        });
    }
    // loginData for 2FA user info retrieval
    loginData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, email } = req.body;
            const token_verify = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_HOTEL);
            const user_model = this.Model.UserModel();
            if (!token_verify) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: this.ResMsg.HTTP_UNAUTHORIZED,
                };
            }
            const { email: verify_email } = token_verify;
            if (email === verify_email) {
                const checkUser = yield user_model.getSingleCommonAuthUser({
                    schema_name: "hotelier",
                    table_name: constants_1.USER_AUTHENTICATION_VIEW.HOTELIER,
                    email,
                });
                if (!checkUser) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                const rest = __rest(checkUser, []);
                if (rest.organization_status !== constants_1.USER_STATUS.ACTIVE) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_FORBIDDEN,
                        message: `Account Inactive: Your account status is '${rest.organization_status}'. Please contact ${constants_1.PROJECT_NAME} support to activate your account.`,
                    };
                }
                const token_data = {
                    user_id: rest.user_id,
                    name: rest.name,
                    phone_number: rest.phone_number,
                    photo: rest.photo,
                    status: rest.user_status,
                    email: rest.email,
                    organization_status: rest.organization_status,
                };
                const token = lib_1.default.createToken(token_data, config_1.default.JWT_SECRET_HOTEL, constants_1.LOGIN_TOKEN_EXPIRES_IN);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.LOGIN_SUCCESSFUL,
                    data: token_data,
                    token,
                };
            }
            else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_FORBIDDEN,
                    message: this.StatusCode.HTTP_FORBIDDEN,
                };
            }
        });
    }
    //forget pass
    forgetPassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, email, password } = req.body;
            const token_verify = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_HOTEL);
            if (!token_verify) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: this.ResMsg.HTTP_UNAUTHORIZED,
                };
            }
            const { email: verify_email } = token_verify;
            if (email === verify_email) {
                const hashed_pass = yield lib_1.default.hashValue(password);
                const model = this.Model.UserModel();
                const [get_user] = yield model.checkUser({
                    email,
                    type: constants_1.USER_TYPE.HOTELIER,
                });
                yield model.updateProfile({ password_hash: hashed_pass }, { id: get_user.id });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.PASSWORD_CHANGED,
                };
            }
            else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_FORBIDDEN,
                    message: this.StatusCode.HTTP_FORBIDDEN,
                };
            }
        });
    }
}
exports.default = HotelierAuthService;
