export function keysFromSnakeToCamel(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const newObj: Record<string, unknown> = {};

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_match: string, p1: string) =>
        p1.toUpperCase()
      );
      const value = obj[key];

      if (typeof value === "object" && value !== null) {
        newObj[camelKey] = keysFromSnakeToCamel(
          value as Record<string, unknown>
        );
      } else {
        newObj[camelKey] = value;
      }
    }
  }

  return newObj;
}
