import { define, setGlobalOptions, mergeStrategy, mergeOptions } from './options';
import { getCacheForData, destroyCache } from './cache';
import { getInstance } from './instance';
export * from './constants';
export * from './types';
export { define, setGlobalOptions, mergeStrategy, mergeOptions };
export { getCacheForData, destroyCache };
export default getInstance;
