/**
 * Role-Based Access Control (RBAC) System for AgentLadders.
 * 
 * Hierarchy:
 * 1. SUPER_ADMIN: AgentLadders Platform HQ (Universal system oversight)
 * 2. OWNER: Supreme Agency Founder / Proprietor (Full ownership & billing authority)
 * 3. MANAGER: Real Estate Agency Team Leader (Team management, inventory & deals)
 * 4. ADMIN: Operational Administrator (Billing, configuration, branding, invoices)
 * 5. AGENT: Licensed Broker / Sales Agent (Active inventory, inquiries & client deals)
 * 6. READONLY: Read-Only Broker / Trainee / Auditor (View-only across all records)
 */

export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'ADMIN' | 'AGENT' | 'READONLY';

export function normalizeRole(role?: string): UserRole {
  const r = (role || '').toUpperCase().trim();
  if (r === 'SUPER_ADMIN' || r === 'SUPERADMIN') return 'SUPER_ADMIN';
  if (r === 'OWNER') return 'OWNER';
  if (r === 'MANAGER') return 'MANAGER';
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'READONLY' || r === 'READ_ONLY' || r === 'VIEWER') return 'READONLY';
  return 'AGENT';
}

/**
 * Checks whether caller has authority to modify a target user's role.
 */
export function canUpdateUserRole(
  callerRoleRaw?: string,
  targetRoleRaw?: string,
  newRoleRaw?: string,
  callerIsSuperAdmin: boolean = false
): { allowed: boolean; reason?: string } {
  if (callerIsSuperAdmin) return { allowed: true };

  const callerRole = normalizeRole(callerRoleRaw);
  const targetRole = normalizeRole(targetRoleRaw);
  const newRole = normalizeRole(newRoleRaw);

  // RULE 1: No one can remove or change the OWNER role
  if (targetRole === 'OWNER') {
    return {
      allowed: false,
      reason: 'The Agency Owner role is permanent and cannot be modified or demoted by anyone.'
    };
  }

  // RULE 2: Only Owner can grant the OWNER role
  if (newRole === 'OWNER' && callerRole !== 'OWNER') {
    return {
      allowed: false,
      reason: 'Only the Agency Owner can assign or transfer the Owner role.'
    };
  }

  // RULE 3: Owner has full control over all non-owner roles
  if (callerRole === 'OWNER') {
    return { allowed: true };
  }

  // RULE 4: Manager can update Admin, Agent, and Read-Only roles
  if (callerRole === 'MANAGER') {
    // Manager cannot edit another Manager or Owner
    if (targetRole === 'MANAGER') {
      return {
        allowed: false,
        reason: 'Managers cannot alter the role of other Managers. Contact the Agency Owner.'
      };
    }
    // Manager cannot promote anyone to Manager or Owner
    if (newRole === 'MANAGER' || newRole === 'OWNER') {
      return {
        allowed: false,
        reason: 'Only the Agency Owner can promote members to Manager or Owner.'
      };
    }
    // Manager can freely assign ADMIN, AGENT, READONLY
    if (['ADMIN', 'AGENT', 'READONLY'].includes(newRole)) {
      return { allowed: true };
    }
  }

  // RULE 5: Admin, Agent, and Read-Only cannot manage roles
  return {
    allowed: false,
    reason: `Access Denied: ${callerRole} accounts cannot modify team roles. Only the Agency Owner and Managers have permission.`
  };
}

/**
 * Checks whether caller has authority to remove a user from the agency.
 */
export function canRemoveUser(
  callerRoleRaw?: string,
  targetRoleRaw?: string,
  callerIsSuperAdmin: boolean = false
): { allowed: boolean; reason?: string } {
  if (callerIsSuperAdmin) return { allowed: true };

  const callerRole = normalizeRole(callerRoleRaw);
  const targetRole = normalizeRole(targetRoleRaw);

  // RULE 1: No one can remove the OWNER
  if (targetRole === 'OWNER') {
    return {
      allowed: false,
      reason: 'The Agency Owner cannot be removed from the agency account.'
    };
  }

  // RULE 2: Owner can remove any non-owner member
  if (callerRole === 'OWNER') {
    return { allowed: true };
  }

  // RULE 3: Manager can remove Admin, Agent, and Read-Only members
  if (callerRole === 'MANAGER') {
    if (targetRole === 'MANAGER') {
      return {
        allowed: false,
        reason: 'Managers cannot remove other Managers. Contact the Agency Owner.'
      };
    }
    return { allowed: true };
  }

  // RULE 4: Admin, Agent, and Read-Only cannot remove members
  return {
    allowed: false,
    reason: `Access Denied: ${callerRole} accounts cannot remove team members.`
  };
}

/**
 * Checks whether caller has authority to invite new team members.
 */
export function canInviteUsers(callerRoleRaw?: string, callerIsSuperAdmin: boolean = false): boolean {
  if (callerIsSuperAdmin) return true;
  const callerRole = normalizeRole(callerRoleRaw);
  return callerRole === 'OWNER' || callerRole === 'MANAGER';
}

/**
 * Checks allowed roles the caller can invite.
 */
export function getAllowedInviteRoles(callerRoleRaw?: string, callerIsSuperAdmin: boolean = false): UserRole[] {
  if (callerIsSuperAdmin) return ['MANAGER', 'ADMIN', 'AGENT', 'READONLY'];
  const callerRole = normalizeRole(callerRoleRaw);
  if (callerRole === 'OWNER') return ['MANAGER', 'ADMIN', 'AGENT', 'READONLY'];
  if (callerRole === 'MANAGER') return ['ADMIN', 'AGENT', 'READONLY'];
  return [];
}

/**
 * Checks CRM record mutation permissions (Properties, Leads, Deals).
 */
export function canMutateCRMRecords(callerRoleRaw?: string, callerIsSuperAdmin: boolean = false): boolean {
  if (callerIsSuperAdmin) return true;
  const callerRole = normalizeRole(callerRoleRaw);
  return callerRole !== 'READONLY';
}

/**
 * Checks financial management permissions (Invoices, Expenses).
 */
export function canManageFinancials(callerRoleRaw?: string, callerIsSuperAdmin: boolean = false): boolean {
  if (callerIsSuperAdmin) return true;
  const callerRole = normalizeRole(callerRoleRaw);
  return ['OWNER', 'MANAGER', 'ADMIN'].includes(callerRole);
}

/**
 * Checks subscription and billing upgrade permissions.
 */
export function canManageBilling(callerRoleRaw?: string, callerIsSuperAdmin: boolean = false): boolean {
  if (callerIsSuperAdmin) return true;
  const callerRole = normalizeRole(callerRoleRaw);
  return callerRole === 'OWNER';
}
