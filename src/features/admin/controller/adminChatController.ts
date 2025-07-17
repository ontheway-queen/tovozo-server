import { Request, Response } from "express";
import Joi from "joi";
import AbstractController from "../../../abstract/abstract.controller";
import AdminChatService from "../services/adminChatService";

class AdminChatController extends AbstractController {
  private services = new AdminChatService();
  constructor() {
    super();
  }

  public createChatSession = this.asyncWrapper.wrap(
    { bodySchema: Joi.object().unknown(true) },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.createChatSession(req);
      res.status(code).json(data);
    }
  );

  public getChatSession = this.asyncWrapper.wrap(
    { querySchema: Joi.object().unknown(true) },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.getChatSession(req);
      res.status(code).json(data);
    }
  );

  public getChatMessages = this.asyncWrapper.wrap(
    { querySchema: Joi.object().unknown(true) },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.getChatMessages(req);

      res.status(code).json(data);
    }
  );

  public createChatMessage = this.asyncWrapper.wrap(
    { bodySchema: Joi.object().unknown(true) },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.createChatMessage(req);
      res.status(code).json(data);
    }
  );
}

export default AdminChatController;
