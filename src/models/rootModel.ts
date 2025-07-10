import { Knex } from "knex";
import { db } from "../app/database";
import AdministrationModel from "./adminModel/administrationModel";
import AdminModel from "./adminModel/adminModel";
import CommonModel from "./commonModel/commonModel";
import JobPostModel from "./hotelierModel/jobPostModel";
import OrganizationModel from "./hotelierModel/organizationModel";
import JobModel from "./jobModel/jobModel";
import JobSeekerModel from "./jobSeekerModel/jobSeekerModel";
import UserModel from "./userModel/userModel";
import JobApplicationModel from "./jobApplicationModel/jobApplicationModel";
import JobTaskActivitiesModel from "./jobTaskActivitiesModel/jobTaskActivitiesModel";
import ReportModel from "./reportModel/reportModel";
import CancellationLogModel from "./cancellationLogModel/cancellationLogModel";

export default class Models {
	public UserModel(trx?: Knex.Transaction) {
		return new UserModel(trx || db);
	}
	public AdminModel(trx?: Knex.Transaction) {
		return new AdminModel(trx || db);
	}

	// job seeker model
	public jobSeekerModel(trx?: Knex.Transaction) {
		return new JobSeekerModel(trx || db);
	}

	// common models
	public commonModel(trx?: Knex.Transaction) {
		return new CommonModel(trx || db);
	}

	// organization model
	public organizationModel(trx?: Knex.Transaction) {
		return new OrganizationModel(trx || db);
	}

	//administration model
	public administrationModel(trx?: Knex.Transaction) {
		return new AdministrationModel(trx || db);
	}

	// job model
	public jobModel(trx?: Knex.Transaction) {
		return new JobModel(trx || db);
	}

	// jobPost model
	public jobPostModel(trx?: Knex.Transaction) {
		return new JobPostModel(trx || db);
	}

	// job application model
	public jobApplicationModel(trx?: Knex.Transaction) {
		return new JobApplicationModel(trx || db);
	}

	// cancellation report model
	public cancellationLogModel(trx?: Knex.Transaction) {
		return new CancellationLogModel(trx || db);
	}

	// job task activities
	public jobTaskActivitiesModel(trx?: Knex.Transaction) {
		return new JobTaskActivitiesModel(trx || db);
	}

	// report
	public reportModel(trx?: Knex.Transaction) {
		return new ReportModel(trx || db);
	}
}
