export default class Schema {
	protected readonly PUBLIC_SCHEMA = "public";
	protected readonly DBO_SCHEMA = "dbo";
	protected readonly ADMIN_SCHEMA = "admin";
	protected readonly JOB_SEEKER = "jobseeker";
	protected readonly HOTELIER = "hotelier";
	protected readonly TABLES = {
		user: "user",
		maintenance_designation: "maintenance_designation",
		last_no: "last_no",
		audit_trail: "audit_trail",
		jobs: "jobs",
		job_post: "job_post",
		job_post_details: "job_post_details",
		job_applications: "job_applications",
		nationality: "nationality",
		location: "location",
		notification: "notification",
		organization: "organization",
		organization_photos: "organization_photos",
		notification_seen: "notification_seen",
		notification_delete: "notification_delete",
		job_seeker: "job_seeker",
	};
}
