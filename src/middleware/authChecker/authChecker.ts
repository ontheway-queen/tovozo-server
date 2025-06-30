import { NextFunction, Request, Response } from "express";
import config from "../../app/config";
import { db } from "../../app/database";
import {
  ITokenParseAdmin,
  ITokenParseHotelier,
  ITokenParseJobSeeker,
} from "../../features/public/utils/types/publicCommon.types";
import UserModel from "../../models/userModel/userModel";
import Lib from "../../utils/lib/lib";
import { USER_TYPE } from "../../utils/miscellaneous/constants";
import ResMsg from "../../utils/miscellaneous/responseMessage";
import StatusCode from "../../utils/miscellaneous/statusCode";

export default class AuthChecker {
  // admin auth checker

  public adminAuthChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { authorization } = req.headers;

    if (!authorization) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }

    const authSplit = authorization.split(" ");
    if (authSplit.length !== 2) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }

    const verify = Lib.verifyToken(
      authSplit[1],
      config.JWT_SECRET_ADMIN
    ) as ITokenParseAdmin;

    if (!verify || verify.status === false) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }
    console.log("Admin verification successful:", verify);
    req.admin = verify;
    return next();
  };

  // hotelier auth checker
  public hotelierAuthChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { authorization } = req.headers;

    if (!authorization) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }

    const authSplit = authorization.split(" ");
    if (authSplit.length !== 2) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }

    const verify = Lib.verifyToken(
      authSplit[1],
      config.JWT_SECRET_HOTEL
    ) as ITokenParseHotelier;

    if (!verify) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }

    const { user_id } = verify;
    const userModel = new UserModel(db);

    const [user] = await userModel.checkUser({
      id: user_id,
      type: USER_TYPE.HOTELIER,
    });

    if (!user || !user.status) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }

    req.hotelier = verify;
    next();
  };

  // job seeker auth checker
  public jobSeekerAuthChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { authorization } = req.headers;

    if (!authorization) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }

    const authSplit = authorization.split(" ");
    if (authSplit.length !== 2) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }

    const verify = Lib.verifyToken(
      authSplit[1],
      config.JWT_SECRET_JOB_SEEKER
    ) as ITokenParseJobSeeker;

    if (!verify || verify.status === false) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }

    req.jobSeeker = verify;
    next();
  };
}
