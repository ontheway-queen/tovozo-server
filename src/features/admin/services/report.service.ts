import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import {
	REPORT_STATUS,
	REPORT_TYPE,
} from "../../../utils/miscellaneous/constants";
import {
	IReportStatus,
	IReportType,
} from "../../../utils/modelTypes/report/reportModel.types";

export default class AdminReportService extends AbstractServices {
	constructor() {
		super();
	}

	public getReportsWithInfo = async (req: Request) => {
		const { limit, skip, searchQuery, type, report_status } = req.query;
		const model = this.Model.reportModel();
		const res = await model.getReportsWithInfo({
			limit: Number(limit),
			skip: Number(skip),
			searchQuery: searchQuery as string,
			type: type as IReportType,
			report_status: report_status as IReportStatus,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			...res,
		};
	};

	public getSingleReportWithInfo = async (req: Request) => {
		const id = req.params.id;
		const model = this.Model.reportModel();
		const res = await model.getSingleReportWithInfo(Number(id));
		if (!res) {
			throw new CustomError(
				`The requested report with ID-${id} not found`,
				this.StatusCode.HTTP_NOT_FOUND
			);
		}
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			data: res,
		};
	};

	public reportMarkAsAcknowledge = async (req: Request) => {
		return await this.db.transaction(async (trx) => {
			const { user_id } = req.admin;
			const id = req.params.id;
			const body = req.body;
			const model = this.Model.reportModel(trx);
			const isReportExist = await model.getSingleReport(null, Number(id));
			if (!isReportExist) {
				throw new CustomError(
					`Report with ID ${id} not found`,
					this.StatusCode.HTTP_NOT_FOUND
				);
			}
			if (isReportExist.status !== REPORT_STATUS.Pending) {
				throw new CustomError(
					`Cannot perform this action because the report is already ${isReportExist.status.toLowerCase()}.`,
					this.StatusCode.HTTP_BAD_REQUEST
				);
			}

			body.status = REPORT_STATUS.Acknowledge;
			body.resolved_by = user_id;
			body.resolved_at = new Date();

			await model.reportMarkAsAcknowledge(Number(id), body);

			await this.insertAdminAudit(trx, {
				details: `Report ID - ${id} has been updated.`,
				created_by: user_id,
				endpoint: req.originalUrl,
				type: "UPDATE",
				payload: JSON.stringify(body),
			});

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	};
}
