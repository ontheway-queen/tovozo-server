import { NextFunction, Request, Response } from 'express';
import {
  ITokenParseAdmin,
  ITokenParseHotelier,
  ITokenParseJobSeeker,
} from '../../features/public/utils/types/publicCommon.types';
import { db } from '../../app/database';
import config from '../../app/config';
import StatusCode from '../../utils/miscellaneous/statusCode';
import ResMsg from '../../utils/miscellaneous/responseMessage';
import Lib from '../../utils/lib/lib';
import UserModel from '../../models/userModel/userModel';
import { TypeUser } from '../../utils/modelTypes/user/userModelTypes';

export default class AuthChecker {
  // admin auth checker
  public adminAuthChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { authorization } = req.headers;

    if (!authorization) {
      res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      return;
    }

    const authSplit = authorization.split(' ');

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

    if (!verify) {
      res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      return;
    } else {
      const { user_id } = verify;

      const userModel = new UserModel(db);

      const checkAdmin = await userModel.checkUser({
        id: user_id,
        type: TypeUser.ADMIN,
      });

      if (checkAdmin) {
        if (!checkAdmin.status) {
          res
            .status(StatusCode.HTTP_UNAUTHORIZED)
            .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
        }

        req.admin = {
          is_main: checkAdmin.is_main_user,
          name: checkAdmin.name,
          photo: checkAdmin.photo,
          user_email: checkAdmin.email,
          user_id,
          username: checkAdmin.username,
          phone_number: checkAdmin.phone_number,
        };
        next();
      } else {
        res
          .status(StatusCode.HTTP_UNAUTHORIZED)
          .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      }
    }
  };

  //Hotel  auth checker
  public hotelierAuthChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
    }

    const authSplit = authorization.split(' ');

    if (authSplit.length !== 2) {
      return res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
    }

    const verify = Lib.verifyToken(
      authSplit[1],
      config.JWT_SECRET_HOTEL
    ) as ITokenParseHotelier;

    if (!verify) {
      return res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
    } else {
      const { user_id } = verify;
      const userModel = new UserModel(db);

      const user = await userModel.checkUser({
        id: user_id,
        type: TypeUser.HOTELIER,
      });

      if (user) {
        if (!user.status) {
          return res
            .status(StatusCode.HTTP_UNAUTHORIZED)
            .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
        }

        req.hotelier = {
          name: user?.name,
          phone_number: user?.phone_number,
          photo: user?.photo,
          user_email: user?.email,
          user_id,
          username: user?.username,
          hotel_id,
        };
        next();
      } else {
        return res
          .status(StatusCode.HTTP_UNAUTHORIZED)
          .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      }
    }
  };

  // job seeker auth checker
  public jobSeekerAuthChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { authorization } = req.headers;

    if (!authorization) {
      res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });

      return;
    }

    const authSplit = authorization.split(' ');

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

    if (!verify) {
      res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      return;
    } else {
      const { user_id } = verify;

      const agencyUserModel = new AgencyUserModel(db);

      const checkAgencyUser = await agencyUserModel.checkUser({ id: user_id });

      if (checkAgencyUser) {
        if (!checkAgencyUser.status) {
          res
            .status(StatusCode.HTTP_UNAUTHORIZED)
            .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
          return;
        }

        if (
          checkAgencyUser.agency_status === 'Inactive' ||
          checkAgencyUser.agency_status === 'Incomplete' ||
          checkAgencyUser.agency_status === 'Rejected'
        ) {
          res.status(StatusCode.HTTP_UNAUTHORIZED).json({
            success: false,
            message: ResMsg.HTTP_UNAUTHORIZED,
          });
          return;
        } else {
          req.jobSeeker = {
            agency_email: checkAgencyUser.agency_email,
            agency_id: checkAgencyUser.agency_id,
            agency_name: checkAgencyUser.agency_name,
            is_main_user: checkAgencyUser.is_main_user,
            name: checkAgencyUser.name,
            photo: checkAgencyUser.photo,
            user_email: checkAgencyUser.email,
            user_id,
            username: checkAgencyUser.username,
            phone_number: checkAgencyUser.phone_number,
          };
          next();
        }
      } else {
        res
          .status(StatusCode.HTTP_UNAUTHORIZED)
          .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
        return;
      }
    }
  };
}
