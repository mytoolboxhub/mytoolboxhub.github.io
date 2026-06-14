export interface CronResult {
  expression: string;
  description: string;
  nextRuns: Date[];
  error?: string;
  parts: {
    minute: string;
    hour: string;
    dom: string;
    month: string;
    dow: string;
  };
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function explainCron(expression: string): CronResult {
  const parts = expression.trim().split(/\s+/);
  
  if (parts.length !== 5) {
    return {
      expression,
      description: '',
      nextRuns: [],
      error: 'Invalid cron expression. Expected exactly 5 fields separated by spaces.',
      parts: { minute: '', hour: '', dom: '', month: '', dow: '' }
    };
  }

  const [min, hr, dom, mon, dow] = parts;

  // Basic validation to prevent obvious garbage
  const validate = (str: string, max: number, chars: RegExp) => {
    if (str === '*') return true;
    if (!chars.test(str)) return false;
    return true;
  };

  if (!validate(min, 59, /^[\d,\-\/\*]+$/) ||
      !validate(hr, 23, /^[\d,\-\/\*]+$/) ||
      !validate(dom, 31, /^[\d,\-\/\*\?L]+$/) ||
      !validate(mon, 12, /^[A-Z\d,\-\/\*]+$/i) ||
      !validate(dow, 7, /^[A-Z\d,\-\/\*\?L#]+$/i)) {
    return {
      expression,
      description: '',
      nextRuns: [],
      error: 'Invalid characters found in one or more fields.',
      parts: { minute: min, hour: hr, dom, month: mon, dow }
    };
  }

  const desc = buildDescription(min, hr, dom, mon, dow);
  const nextRuns = getNextRuns(min, hr, dom, mon, dow, 5);

  return {
    expression,
    description: desc,
    nextRuns,
    parts: { minute: min, hour: hr, dom, month: mon, dow }
  };
}

function buildDescription(min: string, hr: string, dom: string, mon: string, dow: string): string {
  let s = 'At ';

  // Minute / Hour
  if (min === '*' && hr === '*') {
    s += 'every minute';
  } else if (min !== '*' && hr === '*') {
    s += `minute ${min} past every hour`;
  } else if (min === '*' && hr !== '*') {
    s += `every minute past hour ${hr}`;
  } else {
    // Both specific
    if (min.includes('/') || hr.includes('/')) {
      s += `minute ${min} past hour ${hr}`;
    } else {
      // Format as HH:MM if simple numbers
      if (/^\d+$/.test(min) && /^\d+$/.test(hr)) {
        s += `${hr.padStart(2, '0')}:${min.padStart(2, '0')}`;
      } else {
        s += `minute ${min} past hour ${hr}`;
      }
    }
  }

  // Day of Month
  if (dom !== '*' && dom !== '?') {
    s += ` on day-of-month ${dom}`;
  }

  // Month
  if (mon !== '*') {
    s += ` in ${mon}`;
  }

  // Day of week
  if (dow !== '*' && dow !== '?') {
    s += ` on ${dow}`;
  }

  // Special case formatting
  if (s === 'At every minute') s = 'Every minute';
  
  // Replace slashes with "every X"
  s = s.replace(/\/(\d+)/g, 'every $1');

  // Capitalize first letter
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getNextRuns(min: string, hr: string, dom: string, mon: string, dow: string, count: number): Date[] {
  // A naive implementation to find the next N runs.
  // For a production app, we would use cron-parser npm package.
  // Since we have a zero-dependency constraint, we implement a basic stepper.
  const runs: Date[] = [];
  let d = new Date();
  d.setSeconds(0);
  d.setMilliseconds(0);
  
  // Prevent infinite loops on impossible dates (e.g. Feb 30)
  let iterations = 0;
  
  while (runs.length < count && iterations < 100000) {
    d.setMinutes(d.getMinutes() + 1);
    iterations++;

    if (matchField(d.getMinutes(), min) &&
        matchField(d.getHours(), hr) &&
        matchField(d.getDate(), dom) &&
        matchField(d.getMonth() + 1, mon, MONTHS) &&
        matchField(d.getDay(), dow, DAYS)) {
      runs.push(new Date(d));
    }
  }

  return runs;
}

function matchField(val: number, expr: string, aliasMap?: string[]): boolean {
  if (expr === '*' || expr === '?') return true;

  // Handle aliases (JAN, MON, etc)
  if (aliasMap && /[A-Z]/i.test(expr)) {
    let e = expr.toUpperCase();
    for (let i = 0; i < aliasMap.length; i++) {
      e = e.replace(new RegExp(aliasMap[i], 'g'), String(aliasMap === MONTHS ? i + 1 : i));
    }
    // Edge case: Sunday can be 0 or 7
    if (aliasMap === DAYS) {
      e = e.replace(/7/g, '0');
    }
    expr = e;
  }

  // Handle lists (1,2,3)
  if (expr.includes(',')) {
    return expr.split(',').some(p => matchField(val, p));
  }

  // Handle step (*/5, 10/2)
  if (expr.includes('/')) {
    const [range, stepStr] = expr.split('/');
    const step = parseInt(stepStr, 10);
    if (range === '*') {
      return val % step === 0;
    }
    if (range.includes('-')) {
      const [start, end] = range.split('-');
      return val >= parseInt(start) && val <= parseInt(end) && (val - parseInt(start)) % step === 0;
    }
    return val >= parseInt(range) && (val - parseInt(range)) % step === 0;
  }

  // Handle ranges (1-5)
  if (expr.includes('-')) {
    const [start, end] = expr.split('-');
    return val >= parseInt(start) && val <= parseInt(end);
  }

  // Exact match
  return val === parseInt(expr, 10);
}
