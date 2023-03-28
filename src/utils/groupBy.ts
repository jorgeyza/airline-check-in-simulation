export function groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
  return array.reduce((result: { [key: string]: T[] }, currentValue: T) => {
    const groupByKey = currentValue[key] as string;
    const group = result[groupByKey] || [];
    group.push(currentValue);
    result[groupByKey] = group;
    return result;
  }, {});
}
