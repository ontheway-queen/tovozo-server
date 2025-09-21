"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const path_1 = __importDefault(require("path"));
const abstract_storatge_1 = __importDefault(require("../../abstract/abstract.storatge"));
const config_1 = __importDefault(require("../../app/config"));
const customError_1 = __importDefault(require("../../utils/lib/customError"));
const uploaderConstants_1 = require("./uploaderConstants");
class Uploader extends abstract_storatge_1.default {
    constructor() {
        super();
    }
    // cloud upload raw
    cloudUploadRaw(folder, types = uploaderConstants_1.allowAllFileTypes) {
        return (req, res, next) => {
            req.upFiles = [];
            const upload = (0, multer_1.default)({
                storage: (0, multer_s3_1.default)({
                    acl: "public-read",
                    s3: this.s3Client,
                    bucket: config_1.default.AWS_S3_BUCKET,
                    contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
                    metadata: function (_req, file, cb) {
                        cb(null, { fieldName: file.fieldname });
                    },
                    key: function (req, file, cb) {
                        const fileWithFolder = folder +
                            "/" +
                            Date.now() +
                            "-" +
                            Math.round(Math.random() * 1e9) +
                            path_1.default.extname(file.originalname);
                        file.filename = fileWithFolder;
                        req.upFiles.push(fileWithFolder);
                        cb(null, `${uploaderConstants_1.ROOT_FILE_FOLDER}/${fileWithFolder}`);
                    },
                }),
                fileFilter: function (_req, file, cb) {
                    // Check allowed extensions
                    if (types.includes(file.mimetype)) {
                        cb(null, true); // no errors
                    }
                    else {
                        cb(new Error("File mimetype is not allowed" +
                            " for " +
                            file.fieldname));
                    }
                },
            });
            upload.any()(req, res, (err) => {
                console.log(req.files);
                if (err) {
                    next(new customError_1.default(err.message, 500));
                }
                else {
                    next();
                }
            });
            console.log("req.upfiles", req.upFiles);
        };
    }
}
exports.default = Uploader;
