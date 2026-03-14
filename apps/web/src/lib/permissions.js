const processRoles = new Set(['operator', 'reviewer', 'admin']);
const reviewRoles = new Set(['reviewer', 'admin']);

export function canUploadAttachments(role) {
  return processRoles.has(role);
}

export function canProcessCases(role) {
  return processRoles.has(role);
}

export function canReviewCases(role) {
  return reviewRoles.has(role);
}

export function formatRoleLabel(role) {
  if (role === 'admin') {
    return 'Admin';
  }

  if (role === 'reviewer') {
    return 'Reviewer';
  }

  if (role === 'operator') {
    return 'Operator';
  }

  return 'Viewer';
}
