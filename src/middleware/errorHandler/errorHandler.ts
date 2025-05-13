import { Request, Response, NextFunction } from 'express';
import ManageFile from '../../utils/lib/manageFile';
import CustomError from '../../utils/lib/customError';
import {
  SOURCE_ADMIN,
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
  SOURCE_B2C,
  SOURCE_EXTERNAL,
} from '../../utils/miscellaneous/constants';
import Models from '../../models/rootModel';

interface ICustomError {
  success: boolean;
  message: string;
  level?: string;
}

export default class ErrorHandler {
  private manageFile: ManageFile;

  constructor() {
    this.manageFile = new ManageFile();
  }

  // handleErrors
  public handleErrors = async (
    err: CustomError,
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    // // file removing starts
    const files = req.upFiles || [];

    if (files.length) {
      await this.manageFile.deleteFromCloud(files);
    }

    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  };
}
