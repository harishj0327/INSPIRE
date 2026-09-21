export const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const classNames = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');
