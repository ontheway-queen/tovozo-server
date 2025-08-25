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
const hotelierJobTaskActivities_service_1 = __importDefault(require("../services/hotelierJobTaskActivities.service"));
const hotelierJobTaskList_validator_1 = __importDefault(require("../utils/validator/hotelierJobTaskList.validator"));
class HotelierJobTaskActivitiesController extends abstract_controller_1.default {
    constructor() {
        super();
        this.hotelierJobTaskActivitiesService = new hotelierJobTaskActivities_service_1.default();
        this.validator = new hotelierJobTaskList_validator_1.default();
        this.approveJobTaskActivity = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.getSingleItemWithIdValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.hotelierJobTaskActivitiesService.approveJobTaskActivity(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createJobTaskList = this.asyncWrapper.wrap({ bodySchema: this.validator.createJobTaskList }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log("body", req.body);
            const _b = yield this.hotelierJobTaskActivitiesService.createJobTaskList(req), { code } = _b, data = __rest(_b, ["code"]);
            res.status(code).json(data);
        }));
        this.updateJobTaskList = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.getSingleItemWithIdValidator,
            bodySchema: this.validator.updateJobTaskList,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _c = yield this.hotelierJobTaskActivitiesService.updateJobTaskList(req), { code } = _c, data = __rest(_c, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteJobTaskList = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.getSingleItemWithIdValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log("id", req.params);
            const _d = yield this.hotelierJobTaskActivitiesService.deleteJobTaskList(req), { code } = _d, data = __rest(_d, ["code"]);
            res.status(code).json(data);
        }));
        this.approveEndJobTaskActivity = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.getSingleItemWithIdValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _e = yield this.hotelierJobTaskActivitiesService.approveEndJobTaskActivity(req), { code } = _e, data = __rest(_e, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = HotelierJobTaskActivitiesController;
