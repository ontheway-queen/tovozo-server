"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const uploaderConstants_1 = require("../middleware/uploader/uploaderConstants");
const config_1 = __importDefault(require("../app/config"));
class CommonAbstractStorage {
    constructor() {
        // aws s3 connect
        this.s3Client = new client_s3_1.S3Client({
            region: 'ap-south-1',
            credentials: {
                accessKeyId: config_1.default.AWS_S3_ACCESS_KEY,
                secretAccessKey: config_1.default.AWS_S3_SECRET_KEY,
            },
        });
        this.allowed_file_types = uploaderConstants_1.allowAllFileTypes;
        this.error_message = 'Only .jpg, .jpeg, .webp or .png format allowed!';
    }
}
exports.default = CommonAbstractStorage;
