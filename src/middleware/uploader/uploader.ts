import { NextFunction, Request, Response } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import CommonAbstractStorage from "../../abstract/abstract.storatge";
import config from "../../app/config";
import CustomError from "../../utils/lib/customError";
import { allowAllFileTypes, ROOT_FILE_FOLDER } from "./uploaderConstants";

class Uploader extends CommonAbstractStorage {
  constructor() {
    super();
  }

  // cloud upload raw
  public cloudUploadRaw(folder: string, types: string[] = allowAllFileTypes) {
    return (req: Request, res: Response, next: NextFunction): void => {
      req.upFiles = [];
      const upload = multer({
        storage: multerS3({
          acl: "public-read",
          s3: this.s3Client,
          bucket: config.AWS_S3_BUCKET,
          contentType: multerS3.AUTO_CONTENT_TYPE,
          metadata: function (_req, file, cb) {
            cb(null, { fieldName: file.fieldname });
          },
          key: function (req, file, cb) {
            const fileWithFolder =
              folder +
              "/" +
              Date.now() +
              "-" +
              Math.round(Math.random() * 1e9) +
              path.extname(file.originalname);

            file.filename = fileWithFolder;
            console.log({ fileWithFolder });
            req.upFiles.push(fileWithFolder);
            cb(null, `${ROOT_FILE_FOLDER}/${fileWithFolder}`);
          },
        }),
        fileFilter: function (_req, file, cb) {
          // Check allowed extensions
          if (types.includes(file.mimetype)) {
            cb(null, true); // no errors
          } else {
            cb(
              new Error(
                "File mimetype is not allowed" + " for " + file.fieldname
              )
            );
          }
        },
      });

      upload.any()(req, res, (err) => {
        console.log(req.files);
        if (err) {
          next(new CustomError(err.message, 500));
        } else {
          next();
        }
      });
      console.log("req.upfiles", req.upFiles);
    };
  }
}
export default Uploader;
