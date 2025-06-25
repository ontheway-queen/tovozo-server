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
const cancellationReport_validator_1 = __importDefault(require("../utils/validator/cancellationReport.validator"));
const cancellationReport_service_1 = __importDefault(require("../services/cancellationReport.service"));
class CancellationReportController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new cancellationReport_service_1.default();
        this.validator = new cancellationReport_validator_1.default();
        this.getReports = this.asyncWrapper.wrap({ querySchema: this.validator.reportQuerySchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getReports(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleReport = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.getSingleItemWithIdValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleReport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.updateCancellationReportStatus = this.asyncWrapper.wrap({
            bodySchema: this.validator.cancellationReportSchema,
            paramSchema: this.commonValidator.getSingleItemWithIdValidator,
            querySchema: this.validator.reportTypeQuerySchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateCancellationReportStatus(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = CancellationReportController;
