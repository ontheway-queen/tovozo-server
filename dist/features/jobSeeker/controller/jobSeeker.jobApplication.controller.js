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
exports.JobSeekerJobApplicationController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const jobSeeker_jobApplication_service_1 = require("../service/jobSeeker.jobApplication.service");
const joi_1 = __importDefault(require("joi"));
const jobApplication_validator_1 = __importDefault(require("../utils/validator/jobApplication.validator"));
class JobSeekerJobApplicationController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new jobSeeker_jobApplication_service_1.JobSeekerJobApplication();
        this.validator = new jobApplication_validator_1.default();
        this.createJobApplication = this.asyncWrapper.wrap({ bodySchema: this.validator.createJobApplicationValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createJobApplication(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getMyJobApplications = this.asyncWrapper.wrap({ querySchema: joi_1.default.object().unknown(true) }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _b = yield this.service.getMyJobApplications(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.getMyJobApplication = this.asyncWrapper.wrap({ paramSchema: joi_1.default.object({ id: joi_1.default.string().required() }) }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.service.getMyJobApplication(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.cancelMyJobApplication = this.asyncWrapper.wrap({
            paramSchema: joi_1.default.object({ id: joi_1.default.string().required() }),
            querySchema: this.validator.cancellationReportTypeValidator,
            bodySchema: this.validator.cancellationReportReasonValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _d = yield this.service.cancelMyJobApplication(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.JobSeekerJobApplicationController = JobSeekerJobApplicationController;
