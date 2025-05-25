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
            last_no: "last_no",
            audit_trail: "audit_trail",
        };
    }
}
exports.default = Schema;
