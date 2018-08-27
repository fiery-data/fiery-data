import { FieryOptionsInput, FieryOptions, FieryInstance, FieryEntry, FierySource, FieryData, FieryChanges, FieryEquality, FieryFields, FieryRecordProperties } from './types';
export declare function closeEntry(entry: FieryEntry | null, remove?: boolean): void;
export declare function getEntry(instance: FieryInstance, source: FierySource, optionsInput?: FieryOptionsInput, name?: string, namedSource?: boolean): FieryEntry;
export declare function getEntryRecordFunctions(instance: FieryInstance): {
    sync: (this: FieryData, fields?: string | string[] | undefined) => Promise<void>;
    update: (this: FieryData, fields?: string | string[] | undefined) => Promise<void>;
    remove: (this: FieryData, excludeSubs?: boolean) => Promise<void>;
    ref: (this: FieryData, sub?: string | undefined) => FierySource;
    clear: (this: FieryData, props: FieryFields) => Promise<void[]>;
    build: <T extends FieryData>(this: FieryData, sub: string, initial?: FieryData | undefined) => T;
    create: <T extends FieryData>(this: FieryData, sub: string, initial?: FieryData | undefined) => T;
    getChanges: (this: FieryData, fieldsOrEquality: string | string[] | FieryEquality, equalityOrNothing?: FieryEquality | undefined) => Promise<FieryChanges>;
};
export declare function getEntryRecordProperties(options: FieryOptions, recordFunctions: any): FieryRecordProperties;
