type QueryObject = Record<string, unknown>;

export const pick = <T extends QueryObject, K extends keyof T>(
  source: T,
  keys: K[],
): Partial<Pick<T, K>> => {
  const result: Partial<Pick<T, K>> = {};

  for (const key of keys) {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }

  return result;
};
