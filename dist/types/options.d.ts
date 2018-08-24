import { FieryOptionsInput, FieryOptions, FieryOptionsMap, FieryInstance, FieryMergeStrategies } from './types';
export declare const globalOptions: {
    defined: FieryOptionsMap;
    user: Partial<FieryOptions> | undefined;
    defaults: Partial<FieryOptions>;
    id: number;
    map: FieryOptionsMap;
};
export declare function getOptionsByKey(key: string): FieryOptions;
export declare function getOptions(options?: FieryOptionsInput, instance?: FieryInstance): FieryOptions;
export declare function recycleOptions(options: FieryOptions): void;
export declare function define(nameOrMap: string | FieryOptionsMap, namedOptions?: Partial<FieryOptions>): void;
export declare function setGlobalOptions(user?: Partial<FieryOptions>): void;
export declare function performMerge(options: Partial<FieryOptions>, defaults?: Partial<FieryOptions>): void;
export declare const mergeStrategy: FieryMergeStrategies;
export declare const mergeOptions: FieryMergeStrategies;
