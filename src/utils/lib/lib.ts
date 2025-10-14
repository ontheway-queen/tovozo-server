import bcrypt from "bcryptjs";

import * as admin from "firebase-admin";
import fs from "fs";
import jwt, { SignOptions } from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Attachment } from "nodemailer/lib/mailer";
import path from "path";
import PDFDocument from "pdfkit";
import config from "../../app/config";
import { TDB } from "../../features/public/utils/types/publicCommon.types";
import CommonModel from "../../models/commonModel/commonModel";

import dotenv from "dotenv";
import puppeteer from "puppeteer";
import { stripe } from "../miscellaneous/stripe";

dotenv.config();

const serviceAccount = require("../../../fcm_tovozo.json");

class Lib {
	// send email by nodemailer
	public static async sendEmailDefault({
		email,
		emailBody,
		emailSub,
		attachments,
	}: {
		email: string;
		emailSub: string;
		emailBody: string;
		attachments?: Attachment[];
	}) {
		try {
			const transporter = nodemailer.createTransport({
				service: "gmail",
				host: "smtp.gmail.com",
				port: 465,
				auth: {
					user: config.EMAIL_SEND_EMAIL_ID,
					pass: config.EMAIL_SEND_PASSWORD,
				},
			});

			const info = await transporter.sendMail({
				from: `TOVOZO <${config.EMAIL_SEND_EMAIL_ID}>`,
				to: email,
				subject: emailSub,
				html: emailBody,
				attachments: attachments || undefined,
			});

			console.log("Message send: %s", info);

			return true;
		} catch (err: any) {
			console.log({ err });
			return false;
		}
	}

	public static async generateHtmlToPdfBuffer(html: string): Promise<Buffer> {
		const browser = await puppeteer.launch({
			headless: true,
			executablePath:
				process.env.NODE_ENV === "development"
					? undefined
					: "/snap/bin/chromium",
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
		try {
			const page = await browser.newPage();
			await page.setViewport({ width: 1280, height: 800 });
			await page.setContent(html, {
				waitUntil: ["load", "domcontentloaded", "networkidle0"],
			});
			const pdfUint8Array = await page.pdf({
				format: "A4",
				printBackground: true,
			});
			return Buffer.from(pdfUint8Array);
		} finally {
			await browser.close();
		}
	}

	// Create hash string
	public static async hashValue(password: string) {
		const salt = await bcrypt.genSalt(10);
		return await bcrypt.hash(password, salt);
	}

	// verify hash string
	public static async compareHashValue(
		password: string,
		hashedPassword: string
	) {
		return await bcrypt.compare(password, hashedPassword);
	}

	// create token
	public static createToken(
		payload: object,
		secret: string,
		expiresIn: SignOptions["expiresIn"]
	) {
		return jwt.sign(payload, secret, { expiresIn });
	}

	// verify token
	public static verifyToken(token: string, secret: string) {
		try {
			return jwt.verify(token, secret);
		} catch (err) {
			return false;
		}
	}

	// generate random Number
	public static otpGenNumber(length: number) {
		const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
		let otp = "";

		for (let i = 0; i < length; i++) {
			const randomNumber = Math.floor(Math.random() * 10);

			otp += numbers[randomNumber];
		}

		return otp;
	}

	// compare object
	public static compareObj(a: any, b: any) {
		return JSON.stringify(a) == JSON.stringify(b);
	}

	// Write file
	public static writeJsonFile(name: string, data: any) {
		const reqFilePath = path.join(`json/${name}.json`);

		fs.writeFile(reqFilePath, JSON.stringify(data, null, 4), (err) => {
			if (err) {
				console.error("Error writing to file:", err);
			} else {
				console.log("JSON data has been written to", reqFilePath);
			}
		});
		// Write response in json data file======================
	}

	// generate Random pass
	public static generateRandomPassword(
		length: number,
		options: {
			includeUppercase?: boolean;
			includeNumbers?: boolean;
			includeSpecialChars?: boolean;
		} = {}
	) {
		const {
			includeUppercase = true,
			includeNumbers = true,
			includeSpecialChars = true,
		} = options;

		const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
		const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const numberChars = "0123456789";
		const specialChars = "!@#$%^&*()_+[]{}|;:',.<>?/";

		let characterPool = lowercaseChars;
		if (includeUppercase) characterPool += uppercaseChars;
		if (includeNumbers) characterPool += numberChars;
		if (includeSpecialChars) characterPool += specialChars;

		if (!characterPool) {
			throw new Error(
				"Character pool cannot be empty. Please enable at least one character type."
			);
		}

		return Array.from(
			{ length },
			() =>
				characterPool[Math.floor(Math.random() * characterPool.length)]
		).join("");
	}

	//remove country code from phone number
	public static removeCountryCodeFromPhoneNumber(phone_number: string) {
		if (phone_number.startsWith("0") && phone_number.length === 11) {
			return phone_number.slice(1); // Remove the first '0'
		} else if (phone_number.startsWith("+880")) {
			return phone_number.slice(4); // Remove the '+880'
		} else if (phone_number.startsWith("880")) {
			return phone_number.slice(3); // Remove the '880'
		} else {
			return phone_number; // Return the whole phone number if none of the conditions are met
		}
	}

	public static generateUsername(full_name: string) {
		const newName = full_name.split(" ").join("");
		return newName.toLowerCase();
	}

	public static async generateNo({ trx, type }: IGenNoParams) {
		let newId = 1001;
		const currYear = new Date().getFullYear();
		const commonModel = new CommonModel(trx);
		let NoCode = "";

		const lastId = await commonModel.getLastId({ type });

		if (lastId) {
			newId = Number(lastId.last_id) + 1;
			await commonModel.updateLastNo(
				{ last_id: newId, last_updated: new Date() },
				lastId?.id
			);
		} else {
			await commonModel.insertLastNo({
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
	}

	public static safeParseJSON(value: any) {
		if (typeof value === "string") {
			try {
				return JSON.parse(value);
			} catch {
				console.log("Error parsing JSON:", value);
				return value;
			}
		}
		return value;
	}

	// get distance using lat and lon
	public static getDistanceFromLatLng(
		hLat1: number,
		hLng1: number,
		lat2: number,
		lng2: number
	): number {
		const toRad = (value: number) => (value * Math.PI) / 180;
		const R = 6371;

		const dLat = toRad(lat2 - hLat1);
		const dLng = toRad(lng2 - hLng1);

		const a =
			Math.sin(dLat / 2) ** 2 +
			Math.cos(toRad(hLat1)) *
				Math.cos(toRad(lat2)) *
				Math.sin(dLng / 2) ** 2;

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c;
	}

	public static async sendNotificationToMobile(params: {
		to: string;
		notificationTitle: string;
		notificationBody: string;
		data?: string;
	}) {
		if (!admin.apps.length) {
			admin.initializeApp({
				credential: admin.credential.cert({
					...(serviceAccount as admin.ServiceAccount),
					privateKey: config.PRIVATE_KEY,
				}),
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
			const response = await admin.messaging().send(message);
			console.log({ "🛑PushNotification": response });

			return response;
		} catch (error: any) {
			if (error.code === "messaging/registration-token-not-registered") {
				console.warn(
					`⚠️ Push token expired or invalid. Token: ${message.token}. 
                User should reopen the app to re-enable notifications.`
				);
				// Optionally remove from DB:
			} else {
				console.error("❌ Error sending notification:", error.message);
			}
			console.error("🚫 error", error);
			return null;
		}
	}

	public static async generateInvoicePDF(
		paymentPayload: any,
		jobPost: any,
		hotelier: any
	) {
		return new Promise<string>((resolve, reject) => {
			const invoicesDir = path.join(__dirname, "../../../invoices");

			// Ensure invoices folder exists
			if (!fs.existsSync(invoicesDir)) {
				fs.mkdirSync(invoicesDir, { recursive: true });
			}

			const filePath = path.join(
				invoicesDir,
				`${paymentPayload.payment_no}.pdf`
			);

			const doc = new PDFDocument();
			const stream = fs.createWriteStream(filePath);
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
			doc.text(
				`Working Hours: ${paymentPayload.total_working_hours ?? "N/A"}`
			);
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
	}

	public static async generatePaymentLink(query: {
		id: number;
		priceId: string;
		job_seeker_id: number;
		job_title: string;
		job_seeker_name: string;
		user_id: number;
	}) {
		const {
			id,
			priceId,
			job_seeker_id,
			job_title,
			job_seeker_name,
			user_id,
		} = query;
		const paymentLink = await stripe.paymentLinks.create({
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
					url: `${config.BASE_URL}/hotelier/payment/verify-checkout-session?session_id={CHECKOUT_SESSION_ID}`,
				},
			},
		});

		console.log({ abcLink: paymentLink.url });
		return paymentLink.url;
	}
}
export default Lib;

interface IGenNoParams {
	trx: TDB;
	type: "Job";
}
