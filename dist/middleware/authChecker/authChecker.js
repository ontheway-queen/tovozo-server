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
const database_1 = require("../../app/database");
const config_1 = __importDefault(require("../../app/config"));
const statusCode_1 = __importDefault(require("../../utils/miscellaneous/statusCode"));
const responseMessage_1 = __importDefault(require("../../utils/miscellaneous/responseMessage"));
const lib_1 = __importDefault(require("../../utils/lib/lib"));
const userModel_1 = __importDefault(require("../../models/userModel/userModel"));
const userModelTypes_1 = require("../../utils/modelTypes/user/userModelTypes");
class AuthChecker {
    constructor() {
        // admin auth checker
        this.adminAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                return;
            }
            const authSplit = authorization.split(' ');
            if (authSplit.length !== 2) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_ADMIN);
            if (!verify) {
                res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                return;
            }
            else {
                const { user_id } = verify;
                const userModel = new userModel_1.default(database_1.db);
                const checkAdmin = yield userModel.checkUser({
                    id: user_id,
                    type: userModelTypes_1.TypeUser.ADMIN,
                });
                if (checkAdmin) {
                    if (!checkAdmin.status) {
                        res
                            .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                            .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                    }
                    req.admin = {
                        is_main: checkAdmin.is_main_user,
                        name: checkAdmin.name,
                        photo: checkAdmin.photo,
                        user_email: checkAdmin.email,
                        user_id,
                        username: checkAdmin.username,
                        phone_number: checkAdmin.phone_number,
                    };
                    next();
                }
                else {
                    res
                        .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                        .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                }
            }
        });
        //Hotel  auth checker
        this.hotelierAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            const authSplit = authorization.split(' ');
            if (authSplit.length !== 2) {
                return res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_HOTEL);
            if (!verify) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            else {
                const { user_id } = verify;
                const userModel = new userModel_1.default(database_1.db);
                const user = yield userModel.checkUser({
                    id: user_id,
                    type: userModelTypes_1.TypeUser.HOTELIER,
                });
                if (user) {
                    if (!user.status) {
                        return res
                            .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                            .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                    }
                    req.hotelier = {
                        name: user === null || user === void 0 ? void 0 : user.name,
                        phone_number: user === null || user === void 0 ? void 0 : user.phone_number,
                        photo: user === null || user === void 0 ? void 0 : user.photo,
                        user_email: user === null || user === void 0 ? void 0 : user.email,
                        user_id,
                        username: user === null || user === void 0 ? void 0 : user.username,
                        hotel_id,
                    };
                    next();
                }
                else {
                    return res
                        .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                        .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                }
            }
        });
        // job seeker auth checker
        this.jobSeekerAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                return;
            }
            const authSplit = authorization.split(' ');
            if (authSplit.length !== 2) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_JOB_SEEKER);
            if (!verify) {
                res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                return;
            }
            else {
                const { user_id } = verify;
                const agencyUserModel = new AgencyUserModel(database_1.db);
                const checkAgencyUser = yield agencyUserModel.checkUser({ id: user_id });
                if (checkAgencyUser) {
                    if (!checkAgencyUser.status) {
                        res
                            .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                            .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                        return;
                    }
                    if (checkAgencyUser.agency_status === 'Inactive' ||
                        checkAgencyUser.agency_status === 'Incomplete' ||
                        checkAgencyUser.agency_status === 'Rejected') {
                        res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                            success: false,
                            message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                        });
                        return;
                    }
                    else {
                        req.jobSeeker = {
                            agency_email: checkAgencyUser.agency_email,
                            agency_id: checkAgencyUser.agency_id,
                            agency_name: checkAgencyUser.agency_name,
                            is_main_user: checkAgencyUser.is_main_user,
                            name: checkAgencyUser.name,
                            photo: checkAgencyUser.photo,
                            user_email: checkAgencyUser.email,
                            user_id,
                            username: checkAgencyUser.username,
                            phone_number: checkAgencyUser.phone_number,
                        };
                        next();
                    }
                }
                else {
                    res
                        .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                        .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                    return;
                }
            }
        });
    }
}
exports.default = AuthChecker;
