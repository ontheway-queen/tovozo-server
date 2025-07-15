"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authChecker_1 = __importDefault(require("../middleware/authChecker/authChecker"));
const uploader_1 = __importDefault(require("../middleware/uploader/uploader"));
const fileFolders_1 = __importDefault(require("../utils/miscellaneous/fileFolders"));
class AbstractRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.uploader = new uploader_1.default();
        this.fileFolders = fileFolders_1.default;
        this.authChecker = new authChecker_1.default();
    }
}
exports.default = AbstractRouter;
