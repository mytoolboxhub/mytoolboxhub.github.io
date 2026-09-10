export function createTaskRunner() {
  let cancel: (() => void) | undefined;
  return function run<T>(task: string, args: unknown[]): Promise<T> {
    cancel?.();
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./tool-worker.ts', import.meta.url), { type: 'module' });
      const finish = () => { clearTimeout(timer); worker.terminate(); cancel = undefined; };
      const timer = setTimeout(() => { finish(); reject(new Error('Processing exceeded 2 seconds. Simplify the pattern or use a smaller input.')); }, 2000);
      cancel = () => { finish(); reject(new Error('Replaced by newer input.')); };
      worker.onmessage = e => { finish(); e.data.error ? reject(new Error(e.data.error)) : resolve(e.data.result); };
      worker.onerror = () => { finish(); reject(new Error('The tool could not process this input.')); };
      worker.postMessage({ task, args });
    });
  };
}
