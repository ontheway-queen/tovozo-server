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
const publicService_1 = __importDefault(require("../services/publicService"));
class PublicController extends abstract_controller_1.default {
    constructor() {
        super();
        this.services = new publicService_1.default();
        //send email otp
        this.sendEmailOtpController = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.sendOtpInputValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.sendOtpToEmailService(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // match email otp
        this.matchEmailOtpController = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.matchEmailOtpInputValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.matchEmailOtpService(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllNotification = this.asyncWrapper.wrap({ querySchema: this.commonValidator.getNotificationValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAllNotification(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteNotification = this.asyncWrapper.wrap({
            querySchema: this.commonValidator.mutationNotificationValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.deleteNotification(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.readNotification = this.asyncWrapper.wrap({
            querySchema: this.commonValidator.mutationNotificationValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.readNotification(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all country
        this.getAllCountry = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAllCountry(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all city
        this.getAllCity = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAllCity(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // get all states
        this.getAllStates = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAllStates(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllNationality = this.asyncWrapper.wrap({ querySchema: this.commonValidator.getNationality }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAllNationality(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllJob = this.asyncWrapper.wrap({ querySchema: this.commonValidator.getAllJobSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAllJob(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = PublicController;
