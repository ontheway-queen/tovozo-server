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
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const administration_service_1 = __importDefault(require("../services/administration.service"));
const administration_validator_1 = __importDefault(require("../utils/validator/administration.validator"));
class AdminAdministrationController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new administration_service_1.default();
        this.validator = new administration_validator_1.default();
        //create role
        this.createRole = this.asyncWrapper.wrap({ bodySchema: this.validator.createRole }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createRole(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //role list
        this.roleList = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.roleList(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //create permission
        this.createPermission = this.asyncWrapper.wrap({ bodySchema: this.validator.createPermission }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createPermission(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //permission list
        this.permissionList = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.permissionList(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get single role permission
        this.getSingleRolePermission = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleRolePermission(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //update role permission
        this.updateRolePermissions = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.updateRolePermissions,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateRolePermissions(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //create admin
        this.createAdmin = this.asyncWrapper.wrap({
            bodySchema: this.validator.createAdmin,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createAdmin(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all admin
        this.getAllAdmin = this.asyncWrapper.wrap({ querySchema: this.validator.getAllAdminQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllAdmin(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get single admin
        this.getSingleAdmin = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleAdmin(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //update admin
        this.updateAdmin = this.asyncWrapper.wrap({ bodySchema: this.validator.updateAdmin }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateAdmin(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = AdminAdministrationController;
