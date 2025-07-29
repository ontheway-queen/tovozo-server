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

			if (body.hourly_rate !== body.job_seeker_pay + body.platform_fee) {
				throw new CustomError(
					"Hourly rate must be equal to job_seeker_pay and platform_fee.",
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

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

			if (body.job_seeker_pay || body.platform_fee) {
				const total =
					(body.job_seeker_pay
						? body.job_seeker_pay
						: check.job_seeker_pay) +
					(body.platform_fee
						? body.platform_fee
						: check.platform_fee);
				console.log(total);
				console.log(check.hourly_rate);
				if (total !== Number(check.hourly_rate)) {
					throw new CustomError(
						`Rate mismatch: expected ${check.hourly_rate}, but received ${total}`,
						this.StatusCode.HTTP_BAD_REQUEST
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
