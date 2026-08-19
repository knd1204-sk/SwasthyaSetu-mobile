export const formatDate = (dateStr: string | undefined | null, format: 'short' | 'long' | 'dateOnly' = 'short'): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');

    if (format === 'dateOnly') {
      return `${day}/${month}/${year}`;
    }

    if (format === 'long') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${monthNames[date.getMonth()]} ${year}, ${hours}:${mins}`;
    }

    return `${day}/${month}/${year} ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
};

export const formatRelativeTime = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

    return formatDate(dateStr, 'dateOnly');
  } catch {
    return dateStr;
  }
};

export const getGreeting = (): 'goodMorning' | 'goodAfternoon' | 'goodEvening' => {
  const hour = new Date().getHours();
  if (hour < 12) return 'goodMorning';
  if (hour < 17) return 'goodAfternoon';
  return 'goodEvening';
};

export const getStatusBadgeVariant = (status: string): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default' => {
  const s = status?.toLowerCase() || '';
  if (s.includes('complete') || s.includes('resolved') || s.includes('ready')) return 'success';
  if (s.includes('active') || s.includes('ongoing') || s.includes('progress')) return 'primary';
  if (s.includes('pending') || s.includes('awaiting')) return 'warning';
  if (s.includes('error') || s.includes('fail') || s.includes('cancel')) return 'error';
  if (s.includes('managed') || s.includes('info')) return 'info';
  return 'default';
};

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatGender = (gender: string | undefined | null): string => {
  if (!gender) return '';
  const g = gender.toLowerCase();
  if (g === 'male' || g === 'm') return 'Male';
  if (g === 'female' || g === 'f') return 'Female';
  if (g === 'other' || g === 'o') return 'Other';
  return capitalize(gender);
};
