export interface ValidationResult {
  valid: boolean;
  error?: { message: string; line: number; column: number };
  data?: unknown;
}

function getLineAndColumn(input: string, position: number) {
  const lines = input.substring(0, position).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  };
}

export function validateJson(input: string): ValidationResult {
  if (!input.trim()) {
    return { valid: false, error: { message: "Input is empty", line: 1, column: 1 } };
  }
  
  try {
    const data = JSON.parse(input);
    return { valid: true, data };
  } catch (e) {
    const errorMsg = (e as Error).message;
    const match = errorMsg.match(/position (\d+)/);
    const position = match ? parseInt(match[1]) : 0;
    const { line, column } = getLineAndColumn(input, position);
    return {
      valid: false,
      error: { message: errorMsg, line, column },
    };
  }
}
