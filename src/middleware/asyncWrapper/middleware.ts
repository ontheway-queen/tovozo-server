import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import CustomError from "../../utils/lib/customError";
import ManageFile from "../../utils/lib/manageFile";
import StatusCode from "../../utils/miscellaneous/statusCode";

type Func = (req: Request, res: Response, next: NextFunction) => Promise<void>;

type Validators = {
  bodySchema?: Joi.ObjectSchema<any>;
  paramSchema?: Joi.ObjectSchema<any>;
  querySchema?: Joi.ObjectSchema<any>;
};

export default class Wrapper {
  private manageFile: ManageFile;

  constructor() {
    this.manageFile = new ManageFile();
  }

  // CONTROLLER ASYNCWRAPPER
  public wrap(schema: Validators | null, cb: Func) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { params, query, body } = req;
        if (schema) {
          if (schema.bodySchema) {
            const validateBody = await schema.bodySchema.validateAsync(body);
            req.body = validateBody;
          }
          if (schema.paramSchema) {
            const validateParams = await schema.paramSchema.validateAsync(
              params
            );
            req.params = validateParams;
          }
          if (schema.querySchema) {
            const validateQuery = await schema.querySchema.validateAsync(query);
            req.query = validateQuery;
          }
        }

        await cb(req, res, next);
      } catch (err: any) {
        console.log({ err }, "error from wrap");

        if (err.isJoi) {
          const files = req.upFiles || [];
          if (files.length) {
            await this.manageFile.deleteFromCloud(files);
          }
          res.status(StatusCode.HTTP_UNPROCESSABLE_ENTITY).json({
            success: false,
            message: err.message,
          });
        } else {
          next(
            new CustomError(err.message, err.status, err.level, err.metadata)
          );
        }
      }
    };
  }
}
