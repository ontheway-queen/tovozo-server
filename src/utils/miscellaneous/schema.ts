export default class Schema {
  protected readonly PUBLIC_SCHEMA = 'public';
  protected readonly DBO_SCHEMA = 'dbo';
  protected readonly ADMIN_SCHEMA = 'admin';
  protected readonly TABLES = {
    user: 'user',
    last_no: 'last_no',
    audit_trail: 'audit_trail',
  };
}
