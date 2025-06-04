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
const config_1 = __importDefault(require("../../../app/config"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const sendEmailOtpTemplate_1 = require("../../../utils/templates/sendEmailOtpTemplate");
class PublicService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //send email otp service
    sendOtpToEmailService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, type } = req.body;
                if (type === constants_1.OTP_TYPE_FORGET_JOB_SEEKER) {
                    // --check if the user exist
                    const userModel = this.Model.UserModel();
                    const checkUser = yield userModel.getSingleCommonAuthUser({
                        email,
                        schema_name: "jobseeker",
                        table_name: constants_1.USER_AUTHENTICATION_VIEW.JOB_SEEKER,
                    });
                    if (!checkUser) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No user has been found with this email",
                        };
                    }
                }
                else if (type === constants_1.OTP_TYPE_FORGET_ADMIN) {
                    const model = this.Model.UserModel(trx);
                    const admin_details = yield model.getSingleCommonAuthUser({
                        email,
                        schema_name: "admin",
                        table_name: constants_1.USER_AUTHENTICATION_VIEW.ADMIN,
                    });
                    if (!admin_details) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: this.ResMsg.NOT_FOUND_USER_WITH_EMAIL,
                        };
                    }
                }
                else if (type === constants_1.OTP_TYPE_VERIFY_JOB_SEEKER) {
                    const userModel = this.Model.UserModel();
                    const checkUser = yield userModel.getSingleCommonAuthUser({
                        email,
                        schema_name: "jobseeker",
                        table_name: constants_1.USER_AUTHENTICATION_VIEW.JOB_SEEKER,
                    });
                    if (!checkUser.length || checkUser[0].is_verified) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No unverified user found.",
                        };
                    }
                }
                else if (type === constants_1.OTP_TYPE_FORGET_HOTELIER) {
                    // --check if the user exist
                    const userModel = this.Model.UserModel();
                    const checkUser = yield userModel.getSingleCommonAuthUser({
                        email,
                        schema_name: "hotelier",
                        table_name: constants_1.USER_AUTHENTICATION_VIEW.HOTELIER,
                    });
                    if (!checkUser) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No user found.",
                        };
                    }
                }
                else if (type === constants_1.OTP_TYPE_TWO_FA_JOB_SEEKER) {
                    const userModel = this.Model.UserModel();
                    const checkAgent = yield userModel.getSingleCommonAuthUser({
                        email,
                        schema_name: "jobseeker",
                        table_name: constants_1.USER_AUTHENTICATION_VIEW.JOB_SEEKER,
                    });
                    if (!checkAgent) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No user found.",
                        };
                    }
                }
                const commonModel = this.Model.commonModel(trx);
                const checkOtp = yield commonModel.getOTP({ email: email, type: type });
                if (checkOtp.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_GONE,
                        message: this.ResMsg.THREE_TIMES_EXPIRED,
                    };
                }
                const otp = lib_1.default.otpGenNumber(6);
                const hashed_otp = yield lib_1.default.hashValue(otp);
                try {
                    const [send_email] = yield Promise.all([
                        email
                            ? lib_1.default.sendEmailDefault({
                                email,
                                emailSub: constants_1.OTP_EMAIL_SUBJECT,
                                emailBody: (0, sendEmailOtpTemplate_1.sendEmailOtpTemplate)(otp, constants_1.OTP_FOR),
                            })
                            : undefined,
                    ]);
                    if (send_email) {
                        yield commonModel.insertOTP({
                            hashed_otp: hashed_otp,
                            email: email,
                            type: type,
                        });
                        return {
                            success: true,
                            code: this.StatusCode.HTTP_OK,
                            message: this.ResMsg.OTP_SENT,
                            data: {
                                email,
                            },
                        };
                    }
                    else {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                            message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                        };
                    }
                }
                catch (error) {
                    console.error("Error sending email or SMS:", error);
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                    };
                }
            }));
        });
    }
    //match email otp service
    matchEmailOtpService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, otp, type } = req.body;
                const commonModel = this.Model.commonModel(trx);
                const userModel = this.Model.UserModel(trx);
                const checkOtp = yield commonModel.getOTP({ email, type });
                if (!checkOtp.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_FORBIDDEN,
                        message: this.ResMsg.OTP_EXPIRED,
                    };
                }
                const { id: email_otp_id, otp: hashed_otp, tried } = checkOtp[0];
                if (tried > 3) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_GONE,
                        message: this.ResMsg.TOO_MUCH_ATTEMPT,
                    };
                }
                const otpValidation = yield lib_1.default.compareHashValue(otp.toString(), hashed_otp);
                if (otpValidation) {
                    yield commonModel.updateOTP({
                        tried: tried + 1,
                        matched: 1,
                    }, { id: email_otp_id });
                    //--change it for member
                    let secret = config_1.default.JWT_SECRET_ADMIN;
                    if (type === constants_1.OTP_TYPE_FORGET_JOB_SEEKER) {
                        secret = config_1.default.JWT_SECRET_JOB_SEEKER;
                    }
                    else if (type === constants_1.OTP_TYPE_VERIFY_JOB_SEEKER) {
                        const checkUser = yield userModel.getSingleCommonAuthUser({
                            email,
                            schema_name: "jobseeker",
                            table_name: constants_1.USER_AUTHENTICATION_VIEW.JOB_SEEKER,
                        });
                        if (!checkUser || (checkUser === null || checkUser === void 0 ? void 0 : checkUser.is_verified)) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: "No unverified user found.",
                            };
                        }
                        yield userModel.updateProfile({ is_verified: true }, { id: checkUser.id });
                        return {
                            success: true,
                            code: this.StatusCode.HTTP_ACCEPTED,
                            message: "User successfully verified.",
                        };
                    }
                    else if (type === constants_1.OTP_TYPE_FORGET_HOTELIER) {
                        secret = config_1.default.JWT_SECRET_HOTEL;
                    }
                    else if (type === constants_1.OTP_TYPE_TWO_FA_HOTELIER) {
                        secret = config_1.default.JWT_SECRET_HOTEL;
                    }
                    else if (type === constants_1.OTP_TYPE_TWO_FA_JOB_SEEKER) {
                        secret = config_1.default.JWT_SECRET_JOB_SEEKER;
                    }
                    else if (type == constants_1.OTP_TYPE_TWO_FA_ADMIN) {
                        const checkUser = yield userModel.getSingleCommonAuthUser({
                            email,
                            schema_name: "admin",
                            table_name: constants_1.USER_AUTHENTICATION_VIEW.ADMIN,
                        });
                        if (checkUser) {
                            yield this.insertAdminAudit(trx, {
                                details: `Admin User ${checkUser.username}(${checkUser.email}) has logged in.`,
                                endpoint: `${req.method} ${req.originalUrl}`,
                                created_by: checkUser.user_id,
                                type: "CREATE",
                            });
                        }
                    }
                    const token = lib_1.default.createToken({
                        email: email,
                        type: type,
                    }, secret, "5m");
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_ACCEPTED,
                        message: this.ResMsg.OTP_MATCHED,
                        type,
                        token,
                    };
                }
                else {
                    yield commonModel.updateOTP({
                        tried: tried + 1,
                    }, { id: email_otp_id });
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.OTP_INVALID,
                    };
                }
            }));
        });
    }
    //get all country
    getAllCountry(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const model = this.Model.commonModel();
            const country_list = yield model.getAllCountry(Object.assign({}, query));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: country_list,
            };
        });
    }
    //get all city
    getAllCity(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { city_id, country_id, limit, skip, name, state_id } = req.query;
            const parsedParams = {
                country_id: country_id ? Number(country_id) : undefined,
                limit: limit ? Number(limit) : undefined,
                skip: skip ? Number(skip) : undefined,
                name: name,
                city_id: city_id ? parseInt(city_id) : 0,
                state_id: state_id ? parseInt(state_id) : 0,
            };
            const model = this.Model.commonModel();
            const city_list = yield model.getAllCity(parsedParams);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: city_list,
            };
        });
    }
    getAllStates(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { state_id, country_id, limit, skip, name } = req.query;
            const parsedParams = {
                country_id: country_id ? Number(country_id) : undefined,
                limit: limit ? Number(limit) : undefined,
                skip: skip ? Number(skip) : undefined,
                name: name,
                state_id: state_id ? parseInt(state_id) : 0,
            };
            const model = this.Model.commonModel();
            const state_list = yield model.getAllStates(parsedParams);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: state_list,
            };
        });
    }
}
exports.default = PublicService;
