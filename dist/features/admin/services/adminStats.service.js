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
const statistics_model_1 = __importDefault(require("../../../models/statistics/statistics.model"));
const dayjs_1 = __importDefault(require("dayjs"));
class AdminStatsService extends abstract_service_1.default {
    constructor() {
        super();
        this.model = new statistics_model_1.default(this.db);
    }
    generateStatistic(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = (0, dayjs_1.default)();
            const { from_date, to_date } = req.query;
            const _a = yield this.model.generateAdminStatistic({
                from: from_date,
                to: to_date,
            }), { rows } = _a, rest = __rest(_a, ["rows"]);
            const financialStats = [];
            for (let i = 0; i < 6; i++) {
                const targetMonth = now.subtract(i, "month").startOf("month");
                const month = targetMonth.format("MMMM");
                const match = rows.find((r) => (0, dayjs_1.default)(r.month).isSame(targetMonth, "month"));
                financialStats.push({
                    month,
                    hotelier_paid: (match === null || match === void 0 ? void 0 : match.hotelier_paid) || 0,
                    job_seeker_get: (match === null || match === void 0 ? void 0 : match.job_seeker_get) || 0,
                    admin_earned: (match === null || match === void 0 ? void 0 : match.admin_earned) || 0,
                });
            }
            return {
                success: false,
                message: "Admin stats getting successfully",
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign({}, rest), { financialStats }),
            };
        });
    }
}
exports.default = AdminStatsService;
