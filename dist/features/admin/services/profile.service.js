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
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
class AdminProfileService extends abstract_service_1.default {
    // Get profile
    getProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.admin;
            const administrationModel = this.Model.administrationModel();
            const adminModel = this.Model.AdminModel();
            const [profile] = yield adminModel.getSingleAdmin({
                id: user_id,
            });
            console.log("Profile data:", profile);
            if (!profile) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const { password_hash, created_by, role_id } = profile, userData = __rest(profile, ["password_hash", "created_by", "role_id"]);
            const [rolePermission = {}] = yield administrationModel.getSingleRole({
                id: role_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, userData), { role_id, permissions: rolePermission }),
            };
        });
    }
    // Edit profile
    editProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.admin;
            const files = req.files;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const userModel = this.Model.UserModel(trx);
                const adminModel = this.Model.AdminModel(trx);
                if (files === null || files === void 0 ? void 0 : files.length) {
                    req.body[files[0].fieldname] = files[0].filename;
                }
                const { username, name, photo, is_2fa_on } = req.body;
                if (username) {
                    const existingAdmins = yield adminModel.getSingleAdmin({
                        username,
                    });
                    if (existingAdmins.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: this.ResMsg.USERNAME_ALREADY_EXISTS,
                        };
                    }
                }
                const updateResult = yield userModel.updateProfile({ username, name, photo }, { id: user_id });
                if (is_2fa_on !== undefined) {
                    yield adminModel.updateAdmin({ is_2fa_on }, { user_id });
                    yield this.insertAdminAudit(trx, {
                        details: `Admin User ${username}(${user_id}) has updated 2FA settings to ${is_2fa_on}.`,
                        endpoint: `${req.method} ${req.originalUrl}`,
                        created_by: user_id,
                        type: "UPDATE",
                    });
                }
                return {
                    success: !!updateResult,
                    code: updateResult
                        ? this.StatusCode.HTTP_OK
                        : this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: updateResult
                        ? this.ResMsg.HTTP_OK
                        : this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                };
            }));
        });
    }
    // Change password
    changePassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.admin;
            const { old_password, new_password } = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const adminModel = this.Model.AdminModel(trx);
                const userModel = this.Model.UserModel(trx);
                const [admin] = yield adminModel.getSingleAdmin({
                    id: user_id,
                });
                if (!admin) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const isOldPasswordValid = yield lib_1.default.compareHashValue(old_password, admin.password_hash);
                if (!isOldPasswordValid) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.PASSWORDS_DO_NOT_MATCH,
                    };
                }
                const password_hash = yield lib_1.default.hashValue(new_password);
                const result = yield userModel.updateProfile({ password_hash }, { id: user_id });
                yield this.insertAdminAudit(trx, {
                    details: `Admin User ${admin.username}(${user_id}) has changed their own password.`,
                    endpoint: `${req.method} ${req.originalUrl}`,
                    created_by: user_id,
                    type: "UPDATE",
                });
                return {
                    success: !!result,
                    code: result
                        ? this.StatusCode.HTTP_OK
                        : this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: result
                        ? this.ResMsg.PASSWORD_CHANGED
                        : this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                };
            }));
        });
    }
}
exports.default = AdminProfileService;
