"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Schema {
    constructor() {
        this.PUBLIC_SCHEMA = "public";
        this.DBO_SCHEMA = "dbo";
        this.ADMIN_SCHEMA = "admin";
        this.JOB_SEEKER = "jobseeker";
        this.HOTELIER = "hotelier";
        this.TABLES = {
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
}
exports.default = Schema;
