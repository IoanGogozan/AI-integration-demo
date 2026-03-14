export function formatDateTime(value) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function formatStatus(value) {
  return value.replaceAll('_', ' ');
}

export function formatLabel(value) {
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatListCount(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatTeamLabel(value) {
  return value ? formatLabel(value) : 'Unassigned';
}
