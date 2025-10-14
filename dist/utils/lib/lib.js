"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const admin = __importStar(require("firebase-admin"));
const fs_1 = __importDefault(require("fs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const config_1 = __importDefault(require("../../app/config"));
const commonModel_1 = __importDefault(require("../../models/commonModel/commonModel"));
const dotenv_1 = __importDefault(require("dotenv"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const stripe_1 = require("../miscellaneous/stripe");
dotenv_1.default.config();
const serviceAccount = require("../../../fcm_tovozo.json");
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
    static generateHtmlToPdfBuffer(html) {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield puppeteer_1.default.launch({
                headless: true,
                // executablePath: "/snap/bin/chromium",
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
            try {
                const page = yield browser.newPage();
                yield page.setViewport({ width: 1280, height: 800 });
                yield page.setContent(html, {
                    waitUntil: ["load", "domcontentloaded", "networkidle0"],
                });
                const pdfUint8Array = yield page.pdf({
                    format: "A4",
                    printBackground: true,
                });
                return Buffer.from(pdfUint8Array);
            }
            finally {
                yield browser.close();
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
    // get distance using lat and lon
    static getDistanceFromLatLng(hLat1, hLng1, lat2, lng2) {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - hLat1);
        const dLng = toRad(lng2 - hLng1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(hLat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    static sendNotificationToMobile(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert(Object.assign(Object.assign({}, serviceAccount), { privateKey: config_1.default.PRIVATE_KEY })),
                });
            }
            const { to, notificationTitle, notificationBody, data } = params;
            const message = {
                token: to,
                notification: {
                    title: notificationTitle,
                    body: notificationBody,
                },
                // data: data ? { payload: data } : undefined,
            };
            try {
                const response = yield admin.messaging().send(message);
                console.log({ "🛑PushNotification": response });
                return response;
            }
            catch (error) {
                if (error.code === "messaging/registration-token-not-registered") {
                    console.warn(`⚠️ Push token expired or invalid. Token: ${message.token}. 
                User should reopen the app to re-enable notifications.`);
                    // Optionally remove from DB:
                }
                else {
                    console.error("❌ Error sending notification:", error.message);
                }
                console.error("🚫 error", error);
                return null;
            }
        });
    }
    static generateInvoicePDF(paymentPayload, jobPost, hotelier) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var _a;
                const invoicesDir = path_1.default.join(__dirname, "../../../invoices");
                // Ensure invoices folder exists
                if (!fs_1.default.existsSync(invoicesDir)) {
                    fs_1.default.mkdirSync(invoicesDir, { recursive: true });
                }
                const filePath = path_1.default.join(invoicesDir, `${paymentPayload.payment_no}.pdf`);
                const doc = new pdfkit_1.default();
                const stream = fs_1.default.createWriteStream(filePath);
                doc.pipe(stream);
                doc.fontSize(20).text("Task Completion Invoice", {
                    align: "center",
                });
                doc.moveDown();
                doc.fontSize(12).text(`Hotelier: ${hotelier[0].name}`);
                doc.text(`Email: ${hotelier[0].email}`);
                doc.moveDown();
                doc.text(`Job Post: ${jobPost.title}`);
                doc.text(`Payment ID: ${paymentPayload.payment_no}`);
                doc.text(`Working Hours: ${(_a = paymentPayload.total_working_hours) !== null && _a !== void 0 ? _a : "N/A"}`);
                doc.moveDown();
                doc.text(`Total Amount: $${paymentPayload.total_amount}`);
                doc.text(`Job Seeker Pay: $${paymentPayload.job_seeker_pay}`);
                doc.text(`Platform Fee: $${paymentPayload.platform_fee}`);
                doc.text(`Transaction Fee: $${paymentPayload.trx_fee}`);
                doc.moveDown();
                console.log({ link: paymentPayload.paymentLink });
                const paymentLink = paymentPayload.paymentLink;
                doc.fontSize(14).fillColor("blue").text("Click here to pay", {
                    link: paymentLink,
                    underline: true,
                });
                doc.end();
                stream.on("finish", () => resolve(filePath));
                stream.on("error", reject);
            });
        });
    }
    static generatePaymentLink(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, priceId, job_seeker_id, job_title, job_seeker_name, user_id, } = query;
            const paymentLink = yield stripe_1.stripe.paymentLinks.create({
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                metadata: {
                    id,
                    job_seeker_id,
                    job_title,
                    job_seeker_name,
                    paid_by: user_id,
                },
                after_completion: {
                    type: "redirect",
                    redirect: {
                        url: `${config_1.default.BASE_URL}/hotelier/payment/verify-checkout-session?session_id={CHECKOUT_SESSION_ID}`,
                    },
                },
            });
            console.log({ abcLink: paymentLink.url });
            return paymentLink.url;
        });
    }
}
exports.default = Lib;
