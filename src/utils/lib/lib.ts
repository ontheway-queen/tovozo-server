import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { TDB } from "../../features/public/utils/types/publicCommon.types";
import { Attachment } from "nodemailer/lib/mailer";
import nodemailer from "nodemailer";
import config from "../../app/config";
import CommonModel from "../../models/commonModel/commonModel";

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
        from: config.EMAIL_SEND_EMAIL_ID,
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
      () => characterPool[Math.floor(Math.random() * characterPool.length)]
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
        return value;
      }
    }
    return value;
  }
}
export default Lib;

interface IGenNoParams {
  trx: TDB;
  type: "Job";
}
