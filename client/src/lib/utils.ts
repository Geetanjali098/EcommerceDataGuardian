import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
  
  if (diff < 60) {
    return `${diff} sec${diff !== 1 ? 's' : ''} ago`;
  }
  
  const mins = Math.floor(diff / 60);
  if (mins < 60) {
    return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  }
  
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return 'Yesterday';
  }
  
  if (days < 30) {
    return `${days} days ago`;
  }
  
  // For older dates, return the formatted date
  return date.toLocaleDateString();
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'running':
    case 'completed':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    case 'failed':
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
    default:
      return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-error';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800 text-warning';
    case 'info':
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-info';
    default:
      return 'bg-gray-50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800 text-gray-500';
  }
}

export function getSeverityIcon(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'exclamation-circle';
    case 'warning':
      return 'exclamation-triangle';
    case 'info':
      return 'info-circle';
    default:
      return 'bell';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 85) {
    return 'bg-success';
  } else if (score >= 70) {
    return 'bg-warning';
  } else {
    return 'bg-error';
  }
}

export function getChangeColor(change: number): string {
  if (change > 0) {
    return 'text-success';
  } else if (change < 0) {
    return 'text-error';
  } else {
    return 'text-gray-500 dark:text-gray-400';
  }
}

export function getChangeIcon(change: number): string {
  if (change > 0) {
    return 'arrow-up';
  } else if (change < 0) {
    return 'arrow-down';
  } else {
    return 'minus';
  }
}

export function downloadCSV(url: string, filename: string = 'export.csv'): void {
  // Create a link element
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  
  // Simulate click to trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
}
