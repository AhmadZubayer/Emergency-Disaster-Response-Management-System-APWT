export const USER_ROLE = {
  USER: 'user',
  VOLUNTEER: 'volunteer',
  RELIEF_ORG: 'relief_org',
  ADMIN: 'admin',
} as const;

export type UserRole =
  (typeof USER_ROLE)[keyof typeof USER_ROLE];