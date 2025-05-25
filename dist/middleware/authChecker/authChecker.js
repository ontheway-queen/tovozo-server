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
const constants_1 = require("../../utils/miscellaneous/constants");
class AuthChecker {
    constructor() {
        // admin auth checker
        this.adminAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const authSplit = authorization.split(" ");
            if (authSplit.length !== 2) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_ADMIN);
            if (!verify || verify.status === false) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            req.admin = verify;
            return next();
        });
        // hotelier auth checker
        this.hotelierAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const authSplit = authorization.split(" ");
            if (authSplit.length !== 2) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_HOTEL);
            if (!verify) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const { user_id } = verify;
            const userModel = new userModel_1.default(database_1.db);
            const user = yield userModel.checkUser({
                id: user_id,
                type: constants_1.USER_TYPE.HOTELIER,
            });
            if (!user || !user.status) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            req.hotelier = verify;
            next();
        });
        // job seeker auth checker
        this.jobSeekerAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const authSplit = authorization.split(" ");
            if (authSplit.length !== 2) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_JOB_SEEKER);
            if (!verify || verify.status === false) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            req.jobSeeker = verify;
            next();
        });
    }
}
exports.default = AuthChecker;
