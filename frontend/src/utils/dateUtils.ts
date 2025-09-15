export const formatDate = (
  date: string | Date,
  locale: string = "tr-TR"
): string => {
  return new Date(date).toLocaleDateString(locale);
};

export const formatDateTime = (
  date: string | Date,
  locale: string = "tr-TR"
): string => {
  return new Date(date).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (
  date: string | Date,
  locale: string = "tr-TR"
): string => {
  return new Date(date).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const isDateInRange = (
  date: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return checkDate >= start && checkDate <= end;
};

export const isDatePassed = (date: string | Date): boolean => {
  return new Date(date) < new Date();
};

export const isDateFuture = (date: string | Date): boolean => {
  return new Date(date) > new Date();
};

export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor(
    (now.getTime() - targetDate.getTime()) / 1000
  );

  if (diffInSeconds < 60) return "Az önce";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} dakika önce`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} gün önce`;

  return formatDate(date);
};
