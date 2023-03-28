type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
    : S;

export type Camelize<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends Array<infer U>
    ? U extends object | undefined
      ? Array<Camelize<U>>
      : T[K]
    : T[K] extends object | undefined
    ? Camelize<T[K]>
    : T[K];
};

function camelCase(str: string) {
  return str.replace(/[_.-](\w|$)/g, (_match, p1: string) => p1.toUpperCase());
}

function walk(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  if (obj instanceof Date || obj instanceof RegExp) return obj;
  if (Array.isArray(obj)) return obj.map((v) => walk(v));

  return Object.keys(obj).reduce(
    (resultObject: { [key: string]: unknown }, key) => {
      const camel = camelCase(key);
      resultObject[camel] = walk((obj as Record<string, unknown>)[key]);
      return resultObject;
    },
    {}
  );
}

export default function camelize<T>(
  obj: T
): T extends string ? string : Camelize<T> {
  const result = typeof obj === "string" ? camelCase(obj) : walk(obj);
  return result as T extends string ? string : Camelize<T>;
}
