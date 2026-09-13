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

export enum VolunteerSkill {
  FIRST_AID = 'first_aid',
  SEARCH_AND_RESCUE = 'search_and_rescue',
  FIRE_SAFETY = 'fire_safety',
  MEDICAL_ASSISTANCE = 'medical_assistance',
  LOGISTICS_TRANSPORT = 'logistics_transport',
  FLOOD_RESCUE = 'flood_rescue',
  SHELTER_MANAGEMENT = 'shelter_management',
  FOOD_DISTRIBUTION = 'food_distribution',
  PSYCHOSOCIAL_SUPPORT = 'psychosocial_support',
  TELECOMMUNICATIONS = 'telecommunications',
  OTHER = 'other',
}

export enum GroupTargetType {
  RESCUE_REQUEST = 'rescue_request',
  MISSING_PERSON = 'missing_person',
}

export enum GroupJoinStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

