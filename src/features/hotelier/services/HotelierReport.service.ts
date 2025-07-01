import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import {
	REPORT_STATUS,
	REPORT_TYPE,
} from "../../../utils/miscellaneous/constants";

export default class HotelierReportService extends AbstractServices {
	constructor() {
		super();
	}

	public submitReport = async (req: Request) => {
		const body = req.body;
		const model = this.Model.reportModel();
		const isReportExist = await model.getSingleReport(
			body.job_post_details_id
		);

		if (isReportExist) {
			throw new CustomError(
				`A report is already submitted for the job post.`,
				this.StatusCode.HTTP_CONFLICT
			);
		}

		const res = await model.submitReport({ ...body });

		if (!res.length) {
			throw new CustomError(
				`Failed to submit the report. Please try again later.`,
				this.StatusCode.HTTP_BAD_REQUEST
			);
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			data: res[0]?.id,
		};
	};

	public getReportsWithInfo = async (req: Request) => {
		const { limit, skip, searchQuery } = req.query;
		const { user_id } = req.hotelier;
		const model = this.Model.reportModel();
		const res = await model.getReportsWithInfo({
			user_id,
			type: REPORT_TYPE.TaskActivity,
			limit: Number(limit),
			skip: Number(skip),
			searchQuery: searchQuery as string,
		});
		console.log(req.hotelier);
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
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			data: res,
		};
	};
}
