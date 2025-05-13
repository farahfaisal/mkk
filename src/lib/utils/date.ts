import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * Format a date to a readable string in Gregorian (Miladi) format
 * @param date The date to format
 * @param formatStr The format string (default: 'yyyy-MM-dd')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 * @param date The date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ar });
}

/**
 * Format a date to a day name
 * @param date The date to format
 * @returns Day name in Arabic
 */
export function formatDayName(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEEE', { locale: ar });
}

/**
 * Get the current date in ISO format (YYYY-MM-DD)
 * @returns Current date in ISO format
 */
export function getCurrentDateISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format a date range
 * @param startDate Start date
 * @param endDate End date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return `${format(start, 'yyyy-MM-dd')} - ${format(end, 'yyyy-MM-dd')}`;
}