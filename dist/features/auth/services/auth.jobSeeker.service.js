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
const constants_1 = require("../../../utils/miscellaneous/constants");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const config_1 = __importDefault(require("../../../app/config"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const jobSeekerRegistrationTemplate_1 = require("../../../utils/templates/jobSeekerRegistrationTemplate");
class JobSeekerAuthService extends abstract_service_1.default {
    //registration service
    registrationService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const files = req.files || [];
                const parseInput = (key) => lib_1.default.safeParseJSON(req.body[key]) || {};
                const userInput = parseInput("user");
                const jobSeekerInput = parseInput("job_seeker");
                const jobPreferencesInput = parseInput("job_preferences");
                const jobLocationsInput = parseInput("job_locations");
                const ownAddressInput = parseInput("own_address");
                const jobShiftingInput = parseInput("job_shifting");
                const jobSeekerInfoInput = parseInput("job_seeker_info");
                const validFileFields = ["visa_copy", "passport_copy", "resume", "photo"];
                // Attach file references
                files.forEach(({ fieldname, filename }) => {
                    if (!validFileFields.includes(fieldname)) {
                        throw new customError_1.default(this.ResMsg.UNKNOWN_FILE_FIELD, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                    }
                    if (fieldname === "photo") {
                        userInput.photo = filename;
                    }
                    else {
                        jobSeekerInfoInput[fieldname] = filename;
                    }
                });
                const { email, phone_number, username, password } = userInput, restUserData = __rest(userInput, ["email", "phone_number", "username", "password"]);
                const userModel = this.Model.UserModel(trx);
                const jobSeekerModel = this.Model.jobSeekerModel(trx);
                const commonModel = this.Model.commonModel(trx);
                const existingUser = yield userModel.checkUser({
                    email,
                    phone_number,
                    username,
                    type: constants_1.USER_TYPE.JOB_SEEKER,
                });
                if (existingUser) {
                    if (existingUser.email === email) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: this.ResMsg.EMAIL_ALREADY_EXISTS,
                        };
                    }
                    if (existingUser.username === username) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: this.ResMsg.USERNAME_ALREADY_EXISTS,
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
                const registration = yield userModel.createUser(Object.assign(Object.assign({}, restUserData), { email,
                    phone_number,
                    username,
                    password_hash, type: constants_1.USER_TYPE.JOB_SEEKER }));
                if (!registration.length) {
                    throw new customError_1.default(this.ResMsg.HTTP_BAD_REQUEST, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                }
                const [ownAddressId] = yield commonModel.createLocation(Object.assign(Object.assign({}, ownAddressInput), { is_home_address: true }));
                const jobSeekerId = registration[0].id;
                console.log({ jobSeekerId, ownAddressId: ownAddressId.id });
                yield jobSeekerModel.createJobSeeker(Object.assign(Object.assign({}, jobSeekerInput), { location_id: ownAddressId.id, user_id: jobSeekerId }));
                const createdLocations = yield commonModel.createLocation(jobLocationsInput);
                const preferenceLocationIds = [
                    ...createdLocations.map((loc) => loc.id),
                    ownAddressId.id,
                ];
                const jobPreferences = jobPreferencesInput.map((job_id) => ({
                    job_seeker_id: jobSeekerId,
                    job_id,
                }));
                const jobLocations = preferenceLocationIds.map((location_id) => ({
                    job_seeker_id: jobSeekerId,
                    location_id,
                }));
                const jobShifts = jobShiftingInput.map((shift) => ({
                    job_seeker_id: jobSeekerId,
                    shift,
                }));
                yield Promise.all([
                    jobSeekerModel.setJobPreferences(jobPreferences),
                    jobSeekerModel.setJobLocations(jobLocations),
                    jobSeekerModel.setJobShifting(jobShifts),
                ]);
                yield jobSeekerModel.createJobSeekerInfo(Object.assign(Object.assign({}, jobSeekerInfoInput), { job_seeker_id: jobSeekerId }));
                const tokenPayload = {
                    user_id: jobSeekerId,
                    username,
                    name: userInput.name,
                    gender: userInput.gender,
                    user_email: email,
                    phone_number,
                    photo: userInput.photo,
                    status: true,
                    create_date: new Date(),
                };
                yield lib_1.default.sendEmailDefault({
                    email,
                    emailSub: `Your registration with ${constants_1.PROJECT_NAME} is under review`,
                    emailBody: (0, jobSeekerRegistrationTemplate_1.registrationJobSeekerTemplate)({ name: userInput.name }),
                });
                const token = lib_1.default.createToken(tokenPayload, config_1.default.JWT_SECRET_JOB_SEEKER, "48h");
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: tokenPayload,
                    token,
                };
            }));
        });
    }
    //login
    loginService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const userModel = this.Model.UserModel();
            const checkUser = yield userModel.getSingleCommonAuthUser({
                schema_name: "jobseeker",
                table_name: constants_1.USER_AUTHENTICATION_VIEW.JOB_SEEKER,
                email,
            });
            console.log({ checkUser });
            if (!checkUser) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.WRONG_CREDENTIALS,
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
            if (rest.account_status !== constants_1.USER_STATUS.ACTIVE) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_FORBIDDEN,
                    message: `Account Inactive: Your account status is '${rest.account_status}'. Please contact ${constants_1.PROJECT_NAME} support to activate your account.`,
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
                    username: rest.username,
                    name: rest.name,
                    gender: rest.gender,
                    phone_number: rest.phone_number,
                    role_id: rest.role_id,
                    photo: rest.photo,
                    status: rest.user_status,
                    email: rest.email,
                    account_status: rest.account_status,
                };
                const token = lib_1.default.createToken(token_data, config_1.default.JWT_SECRET_JOB_SEEKER, "48h");
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
    // The loginData is used to retrieve user information after successfully verifying the user through two-factor authentication.
    LoginData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, email } = req.body;
            const token_verify = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_JOB_SEEKER);
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
                    schema_name: "jobseeker",
                    table_name: constants_1.USER_AUTHENTICATION_VIEW.JOB_SEEKER,
                    email,
                });
                console.log({ checkUser });
                console.log({ checkUser });
                if (!checkUser) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                const { password_hash: hashPass, agency_id } = checkUser, rest = __rest(checkUser, ["password_hash", "agency_id"]);
                if (rest.account_status !== constants_1.USER_STATUS.ACTIVE) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_FORBIDDEN,
                        message: `Account Inactive: Your account status is '${rest.account_status}'. Please contact ${constants_1.PROJECT_NAME} support to activate your account.`,
                    };
                }
                const token_data = {
                    user_id: rest.user_id,
                    username: rest.username,
                    name: rest.name,
                    gender: rest.gender,
                    phone_number: rest.phone_number,
                    role_id: rest.role_id,
                    photo: rest.photo,
                    status: rest.user_status,
                    email: rest.email,
                    account_status: rest.account_status,
                };
                const token = lib_1.default.createToken(token_data, config_1.default.JWT_SECRET_JOB_SEEKER, "48h");
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
            const token_verify = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_JOB_SEEKER);
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
                const get_user = yield model.checkUser({
                    email,
                    type: constants_1.USER_TYPE.JOB_SEEKER,
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
exports.default = JobSeekerAuthService;
