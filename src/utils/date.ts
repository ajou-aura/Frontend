export function formatNoticeDate(iso?: string): string {
  if (!iso) {
    return "";
  }

  const match = iso.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match) {
    const year = match[1].slice(-2);
    const month = match[2].padStart(2, "0");
    const day = match[3].padStart(2, "0");
    return `${year}/${month}/${day}`;
  }

  const parsed = new Date(iso);
  if (!Number.isNaN(parsed.getTime())) {
    const year = String(parsed.getFullYear()).slice(-2);
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  }

  return iso;
}

export function isNew(date: string, days: number = 1): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || days < 0) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((targetDate.getTime() - today.getTime()) / oneDay);

  return Math.abs(diffDays) <= days;
}
