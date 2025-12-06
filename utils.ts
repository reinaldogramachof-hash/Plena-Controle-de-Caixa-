export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  // Handle YYYY-MM-DD manually to prevent timezone shifts (browser converting UTC midnight to previous day)
  const parts = dateString.split('-');
  if (parts.length === 3) {
    // parts[0] is year, [1] is month, [2] is day
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  
  // Fallback for other formats
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const getPeriodDates = (period: 'today' | 'week' | 'month' | 'all') => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (period === 'today') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (period === 'week') {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (period === 'month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(start.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
  } else {
    return null; // All time
  }
  return { start, end };
};