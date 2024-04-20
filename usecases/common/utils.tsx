import { camelCase, mapKeys } from 'lodash';

export const toCamelCaseArr = <T,>(arr: any[]) => {
  return arr.map((item) => mapKeys<any>(item, (v, k) => camelCase(k))) as T[];
};
