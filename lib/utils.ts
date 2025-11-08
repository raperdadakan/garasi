import { isAfter, setDate, addMonths, startOfToday } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Calculates the next upcoming due date based on a start date and rental period.
 * It repeatedly adds the rental period in months to the start date until the resulting
 * due date is in the future.
 * @param startDateString The ISO string of the start date.
 * @param periodeBulan The rental duration in months.
 * @returns The next due date as a Date object.
 */
export const calculateNextDueDate = (startDateString: string, periodeBulan: number): Date => {
  const today = startOfToday();
  const startDate = new Date(startDateString);
  
  // Default to 1 month if period is invalid
  const rentalPeriod = periodeBulan > 0 ? periodeBulan : 1;

  let nextDueDate = new Date(startDate);

  // Keep adding the rental period until the due date is in the future
  while (isAfter(today, nextDueDate)) {
    nextDueDate = addMonths(nextDueDate, rentalPeriod);
  }

  return nextDueDate;
};


export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};