import { minify_sync } from 'terser';
import { parse, generate, walk } from 'css-tree';
export interface MinifyOptions { type: 'css' | 'js' | 'json'; removeComments: boolean; shortenHexColors?: boolean; }
export interface MinifyResult { output: string; stats: { originalSize: number; minifiedSize: number; savedPercentage: number }; error?: string; }
export function minifyCode(code: string, options: MinifyOptions): MinifyResult {
  let output = '', error: string | undefined;
  const originalSize = new TextEncoder().encode(code).length;
  try {
    if (code.trim()) {
      if (options.type === 'json') output = JSON.stringify(JSON.parse(code));
      else if (options.type === 'js') output = minify_sync(code, {
        compress: false, mangle: false, format: { comments: options.removeComments ? false : 'all' }
      }).code || '';
      else {
        const comments: string[] = [];
        const ast = parse(code, { onParseError: e => { throw e; }, onComment: value => { comments.push('/*' + value + '*/'); } });
        if (options.shortenHexColors) walk(ast, node => {
          if (node.type === 'Hash' && /^([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3$/i.test(node.value)) {
            node.value = node.value[0] + node.value[2] + node.value[4];
          }
        });
        output = (options.removeComments ? '' : comments.join('')) + generate(ast);
      }
    }
  } catch (e) { error = String(e); output = ''; }
  const minifiedSize = new TextEncoder().encode(output).length;
  return { output, error, stats: { originalSize, minifiedSize, savedPercentage: originalSize && !error ? Math.round((originalSize-minifiedSize)/originalSize*100) : 0 } };
}
