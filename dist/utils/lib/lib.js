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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs_1 = __importDefault(require("fs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../../app/config"));
const commonModel_1 = __importDefault(require("../../models/commonModel/commonModel"));
class Lib {
    // send email by nodemailer
    static sendEmailDefault(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, emailBody, emailSub, attachments, }) {
            try {
                const transporter = nodemailer_1.default.createTransport({
                    service: "gmail",
                    host: "smtp.gmail.com",
                    port: 465,
                    auth: {
                        user: config_1.default.EMAIL_SEND_EMAIL_ID,
                        pass: config_1.default.EMAIL_SEND_PASSWORD,
                    },
                });
                const info = yield transporter.sendMail({
                    from: `TOVOZO <${config_1.default.EMAIL_SEND_EMAIL_ID}>`,
                    to: email,
                    subject: emailSub,
                    html: emailBody,
                    attachments: attachments || undefined,
                });
                console.log("Message send: %s", info);
                return true;
            }
            catch (err) {
                console.log({ err });
                return false;
            }
        });
    }
    // Create hash string
    static hashValue(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcryptjs_1.default.genSalt(10);
            return yield bcryptjs_1.default.hash(password, salt);
        });
    }
    // verify hash string
    static compareHashValue(password, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcryptjs_1.default.compare(password, hashedPassword);
        });
    }
    // create token
    static createToken(payload, secret, expiresIn) {
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
    }
    // verify token
    static verifyToken(token, secret) {
        try {
            return jsonwebtoken_1.default.verify(token, secret);
        }
        catch (err) {
            return false;
        }
    }
    // generate random Number
    static otpGenNumber(length) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
        let otp = "";
        for (let i = 0; i < length; i++) {
            const randomNumber = Math.floor(Math.random() * 10);
            otp += numbers[randomNumber];
        }
        return otp;
    }
    // compare object
    static compareObj(a, b) {
        return JSON.stringify(a) == JSON.stringify(b);
    }
    // Write file
    static writeJsonFile(name, data) {
        const reqFilePath = path_1.default.join(`json/${name}.json`);
        fs_1.default.writeFile(reqFilePath, JSON.stringify(data, null, 4), (err) => {
            if (err) {
                console.error("Error writing to file:", err);
            }
            else {
                console.log("JSON data has been written to", reqFilePath);
            }
        });
        // Write response in json data file======================
    }
    // generate Random pass
    static generateRandomPassword(length, options = {}) {
        const { includeUppercase = true, includeNumbers = true, includeSpecialChars = true, } = options;
        const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
        const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numberChars = "0123456789";
        const specialChars = "!@#$%^&*()_+[]{}|;:',.<>?/";
        let characterPool = lowercaseChars;
        if (includeUppercase)
            characterPool += uppercaseChars;
        if (includeNumbers)
            characterPool += numberChars;
        if (includeSpecialChars)
            characterPool += specialChars;
        if (!characterPool) {
            throw new Error("Character pool cannot be empty. Please enable at least one character type.");
        }
        return Array.from({ length }, () => characterPool[Math.floor(Math.random() * characterPool.length)]).join("");
    }
    //remove country code from phone number
    static removeCountryCodeFromPhoneNumber(phone_number) {
        if (phone_number.startsWith("0") && phone_number.length === 11) {
            return phone_number.slice(1); // Remove the first '0'
        }
        else if (phone_number.startsWith("+880")) {
            return phone_number.slice(4); // Remove the '+880'
        }
        else if (phone_number.startsWith("880")) {
            return phone_number.slice(3); // Remove the '880'
        }
        else {
            return phone_number; // Return the whole phone number if none of the conditions are met
        }
    }
    static generateUsername(full_name) {
        const newName = full_name.split(" ").join("");
        return newName.toLowerCase();
    }
    static generateNo(_a) {
        return __awaiter(this, arguments, void 0, function* ({ trx, type }) {
            let newId = 1001;
            const currYear = new Date().getFullYear();
            const commonModel = new commonModel_1.default(trx);
            let NoCode = "";
            const lastId = yield commonModel.getLastId({ type });
            if (lastId) {
                newId = Number(lastId.last_id) + 1;
                yield commonModel.updateLastNo({ last_id: newId, last_updated: new Date() }, lastId === null || lastId === void 0 ? void 0 : lastId.id);
            }
            else {
                yield commonModel.insertLastNo({
                    last_id: newId,
                    last_updated: new Date(),
                    type,
                });
            }
            switch (type) {
                case "Job":
                    NoCode = "JOB";
                    break;
                default:
                    break;
            }
            return "T" + NoCode + currYear + newId;
        });
    }
    static safeParseJSON(value) {
        if (typeof value === "string") {
            try {
                return JSON.parse(value);
            }
            catch (_a) {
                console.log("Error parsing JSON:", value);
                return value;
            }
        }
        return value;
    }
}
exports.default = Lib;
