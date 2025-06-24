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
const hotelierJobPost_service_1 = __importDefault(require("../services/hotelierJobPost.service"));
const hotelierJobPost_validator_1 = require("../utils/validator/hotelierJobPost.validator");
class HotelierJobPostController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new hotelierJobPost_service_1.default();
        this.validator = new hotelierJobPost_validator_1.HotelierJobPostValidator();
        this.createJobPost = this.asyncWrapper.wrap({ bodySchema: this.validator.createJobPostSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createJobPost(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getJobPostList = this.asyncWrapper.wrap({ querySchema: this.validator.getJobPostSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getJobPostList(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getSingleJobPostWithJobSeekerDetails = this.asyncWrapper.wrap({ paramSchema: this.validator.getSingleJobPostSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleJobPostWithJobSeekerDetails(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.updateJobPost = this.asyncWrapper.wrap({
            paramSchema: this.validator.getSingleJobPostSchema,
            bodySchema: this.validator.updateJobPostSchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateJobPost(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.cancelJobPost = this.asyncWrapper.wrap({ paramSchema: this.validator.getSingleJobPostSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.cancelJobPost(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = HotelierJobPostController;
