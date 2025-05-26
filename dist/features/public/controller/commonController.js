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
const commonService_1 = __importDefault(require("../commonService/commonService"));
const migrateDataService_1 = __importDefault(require("../commonService/migrateDataService"));
class CommonController extends abstract_controller_1.default {
    constructor() {
        super();
        this.commonService = new commonService_1.default();
        this.migrate = new migrateDataService_1.default();
        //send email otp
        this.sendEmailOtpController = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.sendOtpInputValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.sendOtpToEmailService(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // match email otp
        this.matchEmailOtpController = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.matchEmailOtpInputValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.matchEmailOtpService(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all country
        this.getAllCountry = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllCountry(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all city
        this.getAllCity = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllCity(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all airport
        this.getAllAirport = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.airportFilterSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllAirport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //airlines list
        this.getAllAirlines = this.asyncWrapper.wrap({ querySchema: this.commonValidator.airlineFilterSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllAirlines(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //visa list
        this.getAllVisaList = this.asyncWrapper.wrap({ querySchema: this.commonValidator.visaListSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllVisaList(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //single visa
        this.getSingleVisa = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getSingleVisa(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all visa country list
        this.getAllVisaCountryList = this.asyncWrapper.wrap({ querySchema: this.commonValidator.visaListSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllVisaCountryList(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAllTracking = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllTracking(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // get all tour country list
        this.getAllTourCountryList = this.asyncWrapper.wrap({ querySchema: this.commonValidator.visaListSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllTourCountryList(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //migrate data
        this.dataMigrate = this.asyncWrapper.wrap(null, (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.migrate.migrateAirlineImage(), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getActiveOnlyBannerImage = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getActiveOnlyBannerImage(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(Number(code)).json(data);
        }));
        this.getAllBlog = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllBlog(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getSingleBlog = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getSingleBlog(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //get all announcement
        this.getAllAnnouncementList = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllAnnouncementList(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = CommonController;
