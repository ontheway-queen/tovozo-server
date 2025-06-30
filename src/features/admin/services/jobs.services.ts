import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import { ICreateJobPayload } from "../../../utils/modelTypes/jobs/jobsModelTypes";

class AdminJobService extends AbstractServices {
  public async createJob(req: Request) {
    const { user_id } = req.admin;
    const body = req.body as ICreateJobPayload;
    return await this.db.transaction(async (trx) => {
      const model = this.Model.jobModel(trx);

      const check = await model.getAllJobs(
        { title: body.title, limit: "1" },
        false
      );
      if (check.data.length) {
        throw new CustomError(
          "Job title already exists!",
          this.StatusCode.HTTP_CONFLICT
        );
      }
      const res = await model.createJob(body);
      if (!res) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND
        );
      }
      await this.insertAdminAudit(trx, {
        details: `A new job titled "${body.title}" has been created.`,
        endpoint: req.originalUrl,
        created_by: user_id,
        type: "CREATE",
        payload: JSON.stringify(body),
      });
      return {
        success: true,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        code: this.StatusCode.HTTP_SUCCESSFUL,
      };
    });
  }

  public async getAllJob(req: Request) {
    const model = this.Model.jobModel();
    const data = await model.getAllJobs(req.query);
    return {
      success: true,
      message: this.ResMsg.HTTP_OK,
      code: this.StatusCode.HTTP_OK,
      ...data,
    };
  }

  public async updateJob(req: Request) {
    const { id } = req.params as unknown as { id: number };
    const { user_id } = req.admin;
    return await this.db.transaction(async (trx) => {
      const model = this.Model.jobModel();
      const body = req.body as Partial<ICreateJobPayload>;

      const check = await model.getSingleJob(id);
      if (!check) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND
        );
      }

      if (body.title) {
        const checkTitle = await model.getAllJobs(
          { title: body.title, limit: "1" },
          false
        );
        if (checkTitle.data.length) {
          throw new CustomError(
            "Job title already exists!",
            this.StatusCode.HTTP_CONFLICT
          );
        }
      }

      await model.updateJob(body, id);
      await this.insertAdminAudit(trx, {
        details: `The job titled "${check.title}(${id})" has been updated.`,
        endpoint: `${req.originalUrl}`,
        created_by: user_id,
        type: "UPDATE",
        payload: JSON.stringify(body),
      });

      return {
        success: true,
        message: this.ResMsg.HTTP_OK,
        code: this.StatusCode.HTTP_OK,
      };
    });
  }

  public async deleteJob(req: Request) {
    const { id } = req.params as unknown as { id: number };
    const { user_id } = req.admin;
    return await this.db.transaction(async (trx) => {
      const model = this.Model.jobModel();

      const check = await model.getSingleJob(id);
      if (!check) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND
        );
      }

      await model.deleteJob(id);
      await this.insertAdminAudit(trx, {
        details: `The job titled "${check.title}(${id})" has been deleted.`,
        endpoint: `${req.originalUrl}`,
        created_by: user_id,
        type: "DELETE",
      });
      return {
        success: true,
        message: this.ResMsg.HTTP_OK,
        code: this.StatusCode.HTTP_OK,
      };
    });
  }
}

export default AdminJobService;
