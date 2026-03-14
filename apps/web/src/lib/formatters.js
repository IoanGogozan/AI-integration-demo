export function formatDateTime(value) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function formatStatus(value) {
  return value.replaceAll('_', ' ');
}

export function formatListCount(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}
