import { parseDocument, stringify } from 'yaml';
export interface YamlResult { output: string; error?: string; }
export function jsonToYaml(input: string, indent = 2): YamlResult {
  if (!input.trim()) return { output: '' };
  try { return { output: stringify(JSON.parse(input), { indent, lineWidth: 0 }) }; }
  catch (e) { return { output: '', error: String(e) }; }
}
export function yamlToJson(input: string): YamlResult {
  if (!input.trim()) return { output: '' };
  try {
    const doc = parseDocument(input, { version: '1.2', uniqueKeys: true, stringKeys: true });
    if (doc.errors.length) throw doc.errors[0];
    if (doc.warnings.length) throw doc.warnings[0];
    const data = doc.toJS({ maxAliasCount: 100 });
    const check = (value: unknown, ancestors = new Set<unknown>()): void => {
      if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('JSON cannot represent infinite values or NaN.');
      if (value && typeof value === 'object') {
        if (ancestors.has(value)) throw new Error('JSON cannot represent cyclic YAML aliases.');
        const next = new Set(ancestors); next.add(value);
        Object.values(value).forEach(v => check(v, next));
      }
    };
    check(data);
    return { output: JSON.stringify(data, null, 2) };
  } catch (e) { return { output: '', error: String(e) }; }
}
