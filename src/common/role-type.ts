export enum RoleType {
  VIEW = 1,
  ADMIN = 100,
}

export function hasPermission(userAuthority: number, requiredRole: RoleType): boolean {
  if (requiredRole === RoleType.VIEW) {
    return userAuthority >= RoleType.VIEW;
  }

  if (requiredRole === RoleType.ADMIN) {
    return userAuthority === RoleType.ADMIN;
  }

  return false;
}
