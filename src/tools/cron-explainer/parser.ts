import { CronExpressionParser } from 'cron-parser';
import cronstrue from 'cronstrue';
export interface CronResult { expression: string; description: string; nextRuns: Date[]; error?: string; parts: {minute: string; hour: string; dom: string; month: string; dow: string}; }
export function explainCron(expression: string, currentDate = new Date(), tz = Intl.DateTimeFormat().resolvedOptions().timeZone): CronResult {
  const fields = expression.trim().split(/\s+/);
  const [minute = '', hour = '', dom = '', month = '', dow = ''] = fields;
  const result: CronResult = { expression, description: '', nextRuns: [], parts: {minute, hour, dom, month, dow} };
  if (!expression.trim()) return result;
  try {
    if (fields.length !== 5) throw new Error('Use exactly five fields: minute hour day-of-month month day-of-week.');
    if (/[?LH#]/i.test(expression.replace(/(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|SUN|MON|TUE|WED|THU|FRI|SAT)/gi, ''))) throw new Error('Use standard five-field cron: numbers, names, *, ranges, lists, and steps.');
    const interval = CronExpressionParser.parse(expression, {currentDate, tz});
    result.description = cronstrue.toString(expression, {use24HourTimeFormat: true});
    if (dom !== '*' && dow !== '*') result.description += ' Day-of-month and day-of-week use OR matching.';
    for (let i = 0; i < 5; i++) result.nextRuns.push(interval.next().toDate());
  } catch (e) { result.error = String(e); result.description = ''; result.nextRuns = []; }
  return result;
}
