export const chunkArray = (arr: Array<any>, size: number): Array<any> =>
  arr.length > size
    ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
    : [arr];
