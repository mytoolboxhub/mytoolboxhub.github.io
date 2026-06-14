export interface JsonStats {
  depth: number;
  keys: number;
  arrays: number;
  objects: number;
}

export function getJsonStats(data: unknown): JsonStats {
  let depth = 0;
  let keys = 0;
  let arrays = 0;
  let objects = 0;

  function traverse(obj: any, currentDepth: number) {
    if (currentDepth > depth) depth = currentDepth;

    if (obj === null || typeof obj !== 'object') {
      return;
    }

    if (Array.isArray(obj)) {
      arrays++;
      for (const item of obj) {
        traverse(item, currentDepth + 1);
      }
    } else {
      objects++;
      const objKeys = Object.keys(obj);
      keys += objKeys.length;
      for (const key of objKeys) {
        traverse(obj[key], currentDepth + 1);
      }
    }
  }

  traverse(data, 1);

  // If root is not an object or array, depth is 0.
  if (data === null || typeof data !== 'object') {
    depth = 0;
  }

  return { depth, keys, arrays, objects };
}
