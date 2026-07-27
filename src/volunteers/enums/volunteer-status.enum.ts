export enum VolunteerVerificationStatus {
  NOT_APPLIED = 'not_applied',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum VolunteerTaskStatus {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum FieldReportType {
  BLOCKED_ROUTE = 'blocked_route',
  DANGEROUS_ROUTE = 'dangerous_route',
  RESOURCE_SHORTAGE = 'resource_shortage',
}

export enum ReportSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum OrganizationRequestStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}
