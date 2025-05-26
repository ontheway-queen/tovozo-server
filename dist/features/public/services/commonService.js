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
const constants_1 = require("../../../utils/miscellaneous/constants");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const sendEmailOtp_1 = require("../../../utils/templates/sendEmailOtp");
const responseMessage_1 = __importDefault(require("../../../utils/miscellaneous/responseMessage"));
const config_1 = __importDefault(require("../../../config/config"));
const sabreApiEndpoints_1 = __importDefault(require("../../../utils/miscellaneous/sabreApiEndpoints"));
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
class commonService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Get Sebre token
    getSabreToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data = qs_1.default.stringify({
                    grant_type: "password",
                    username: config_1.default.SABRE_USERNAME,
                    password: config_1.default.SABRE_PASSWORD,
                });
                let axiosConfig = {
                    method: "post",
                    maxBodyLength: Infinity,
                    url: `${config_1.default.SABRE_URL}/${sabreApiEndpoints_1.default.GET_TOKEN_ENDPOINT}`,
                    headers: {
                        Authorization: `Basic ${config_1.default.SABRE_AUTH_TOKEN}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    data: data,
                };
                axios_1.default
                    .request(axiosConfig)
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    const data = response.data;
                    const authModel = this.Model.commonModel();
                    yield authModel.updateEnv(constants_1.SABRE_TOKEN_ENV, data.access_token);
                }))
                    .catch((error) => {
                    console.log(error);
                });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    //send email otp service
    sendOtpToEmailService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, type } = req.body;
                if (type === constants_1.OTP_TYPE_FORGET_USER) {
                    // --check if the user exist
                    const userModel = this.Model.userModel();
                    const checkuser = yield userModel.getProfileDetails({ email });
                    if (!checkuser.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No user has been found with this email",
                        };
                    }
                }
                else if (type === constants_1.OTP_TYPE_FORGET_ADMIN) {
                    const model = this.Model.adminModel(trx);
                    const admin_details = yield model.getSingleAdmin({ email });
                    if (!admin_details.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: this.ResMsg.NOT_FOUND_USER_WITH_EMAIL,
                        };
                    }
                }
                else if (type === constants_1.OTP_TYPE_VERIFY_USER) {
                    const userModel = this.Model.userModel();
                    const checkUser = yield userModel.getProfileDetails({ email });
                    if (!checkUser.length || checkUser[0].is_verified) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No unverified user found.",
                        };
                    }
                }
                else if (type === constants_1.OTP_TYPE_FORGET_AGENT) {
                    const agentModel = this.Model.agencyModel();
                    const checkAgent = yield agentModel.getSingleUser({ email });
                    if (!checkAgent.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No user found.",
                        };
                    }
                    else if (type === constants_1.OTP_TYPE_TWO_FA_AGENT) {
                        const agentModel = this.Model.agencyModel();
                        const checkAgent = yield agentModel.getSingleUser({ email });
                        if (!checkAgent.length) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: "No user found.",
                            };
                        }
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
                const hashed_otp = yield lib_1.default.hashPass(otp);
                try {
                    const [send_email] = yield Promise.all([
                        email
                            ? lib_1.default.sendEmail(email, constants_1.OTP_EMAIL_SUBJECT, (0, sendEmailOtp_1.sendEmailOtpTemplate)(otp, constants_1.OTP_FOR))
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
                const userModel = this.Model.userModel(trx);
                const agentModel = this.Model.agencyModel(trx);
                const checkOtp = yield commonModel.getOTP({ email, type });
                if (!checkOtp.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_FORBIDDEN,
                        message: responseMessage_1.default.OTP_EXPIRED,
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
                const otpValidation = yield lib_1.default.compare(otp.toString(), hashed_otp);
                if (otpValidation) {
                    yield commonModel.updateOTP({
                        tried: tried + 1,
                        matched: 1,
                    }, { id: email_otp_id });
                    //--change it for member
                    let secret = config_1.default.JWT_SECRET_ADMIN;
                    if (type === constants_1.OTP_TYPE_FORGET_USER) {
                        secret = config_1.default.JWT_SECRET_USER;
                    }
                    else if (type === constants_1.OTP_TYPE_VERIFY_USER) {
                        const checkUser = yield userModel.getProfileDetails({ email });
                        if (!checkUser.length || checkUser[0].is_verified) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: "No unverified user found.",
                            };
                        }
                        yield userModel.updateProfile({ is_verified: true }, { id: checkUser[0].id });
                        return {
                            success: true,
                            code: this.StatusCode.HTTP_ACCEPTED,
                            message: "User successfully verified.",
                        };
                    }
                    else if (type === constants_1.OTP_TYPE_FORGET_AGENT) {
                        secret = config_1.default.JWT_SECRET_AGENT;
                    }
                    else if (type === constants_1.OTP_TYPE_TWO_FA_AGENT) {
                        secret = config_1.default.JWT_SECRET_ADMIN;
                    }
                    const token = lib_1.default.createToken({
                        email: email,
                        type: type,
                    }, secret, "5m");
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_ACCEPTED,
                        message: this.ResMsg.OTP_MATCHED,
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
            const model = this.Model.commonModel();
            const { name } = req.query;
            const country_list = yield model.getAllCountry({ name });
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
            const country_id = req.query.country_id;
            const limit = req.query.limit;
            const skip = req.query.skip;
            const name = req.query.name;
            const model = this.Model.commonModel();
            const city_list = yield model.getAllCity(country_id, limit, skip, name);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: city_list,
            };
        });
    }
    //get all airport
    getAllAirport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { country_id, name, limit, skip, is_domestic } = req.query;
            const model = this.Model.commonModel();
            const get_airport = yield model.getAllAirport({ country_id, name, limit, skip, is_domestic }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total: get_airport.total,
                data: get_airport.data,
            };
        });
    }
    //get all airlines
    getAllAirlines(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { code, name, limit, skip } = req.query;
            const model = this.Model.commonModel();
            const get_airlines = yield model.getAllAirline({ code, name, limit, skip }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total: get_airlines.total,
                data: get_airlines.data,
            };
        });
    }
    //get all visa list
    getAllVisaList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            let { country_id, limit, skip, s_visa_for } = req.query;
            const model = this.Model.VisaModel();
            const data = yield model.get({ country_id, status: true, limit, skip, s_visa_for }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get all visa country
    getAllVisaCountryList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            let { limit, skip } = req.query;
            const model = this.Model.VisaModel();
            const data = yield model.getAllVisaCountryList({
                status: true,
                limit,
                skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    // get all tour country list
    getAllTourCountryList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            let { limit, skip } = req.query;
            const model = this.Model.tourPackageModel();
            const data = yield model.getAllTourCountryList({
                status: true,
                limit,
                skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    // Get All Tracking
    getAllTracking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const tracking = yield this.Model.trackingModel().getAllTracking();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: tracking,
            };
        });
    }
    //get single visa
    getSingleVisa(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = +req.params.id;
            const model = this.Model.VisaModel();
            const data = yield model.single(id, true);
            const required_files = yield model.getAllVisaRequiredDocuments({
                visa_id: id,
            });
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            else {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: Object.assign(Object.assign({}, data[0]), { required_files }),
                };
            }
        });
    }
    // Get Active Only Banner Images
    getActiveOnlyBannerImage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const getActiveImages = yield this.Model.adminModel().getActiveBannerImage();
            if (!getActiveImages)
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: getActiveImages,
            };
        });
    }
    // Get a single blog post by ID
    getSingleBlog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.blogModel();
            const blog = yield model.getSingleBlog({ id: Number(id) });
            if (!blog) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: blog,
            };
        });
    }
    //get all announcement list
    getAllAnnouncementList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type } = req.query;
            const data = yield this.Model.announcementModel().getAllAnnouncementBar({
                isActive: true,
                currentDate: new Date(),
                type: type || "B2C",
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data || [],
            };
        });
    }
    // Get a list of blogs
    getAllBlog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.blogModel();
            const { title, limit, skip, author_id } = req.query;
            const { data, total } = yield model.getBlogs({
                author_id,
                title,
                limit,
                skip,
                status: true,
                is_approved: true,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    //update admin
    updateAdmin(payload, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db("user_admin")
                    .withSchema(this.schema.ADMIN_SCHEMA)
                    .update(payload)
                    .where({ id: user_id });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    //update btob user
    updateB2B(payload, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db("btob_user")
                    .withSchema(this.schema.BTOB_SCHEMA)
                    .update(payload)
                    .where({ id: user_id });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
}
exports.default = commonService;
