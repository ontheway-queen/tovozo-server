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
const constants_1 = require("../../../utils/miscellaneous/constants");
class HotelierProfileService extends abstract_service_1.default {
    constructor() {
        super();
        // get profile
        this.getProfile = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.hotelier;
            const userModel = this.Model.UserModel();
            const organizationModel = this.Model.organizationModel();
            const _a = yield userModel.getSingleCommonAuthUser({
                table_name: constants_1.USER_AUTHENTICATION_VIEW.HOTELIER,
                schema_name: "hotelier",
                user_id,
            }), { password_hash } = _a, rest = __rest(_a, ["password_hash"]);
            const [organization_amenities, organization_photos] = yield Promise.all([
                organizationModel.getAmenities({ organization_id: rest.organization_id }),
                organizationModel.getPhotos(rest.organization_id),
            ]);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, rest), { organization_amenities,
                    organization_photos }),
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
}
exports.default = HotelierProfileService;
