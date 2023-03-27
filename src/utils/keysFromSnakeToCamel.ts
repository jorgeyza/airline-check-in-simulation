// this assumes an object will not have another nested array of objects
export function keysFromSnakeToCamel<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item: Record<string, unknown>) =>
      keysFromSnakeToCamel<Record<string, unknown>>(item)
    ) as T;
  } else if (typeof obj === "object" && obj !== null) {
    const newObj: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const camelKey = key.replace(
          /_([a-z])/g,
          (_match: string, p1: string) => p1.toUpperCase()
        );
        newObj[camelKey] = keysFromSnakeToCamel(obj[key]);
      }
    }
    return newObj as T;
  } else {
    return obj;
  }
}
