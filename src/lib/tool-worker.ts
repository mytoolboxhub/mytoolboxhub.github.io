import { testRegex } from '../tools/regex';
import { applyPipeline } from '../tools/string-manipulator';
self.onmessage = e => {
  try {
    const { task, args } = e.data;
    const result = task === 'regex' ? testRegex(args[0], args[1], args[2]) : applyPipeline(args[0], args[1]);
    self.postMessage({ result });
  } catch (e) { self.postMessage({ error: String(e) }); }
};
