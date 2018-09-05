import { FieryOptionsInput, FieryOptions, FieryInstance, FieryEntry, FierySource, FieryData, FieryChanges, FieryEquality, FieryFields, FieryRecordProperties } from './types';
export declare function closeEntry(entry: FieryEntry | null, remove?: boolean): void;
export declare function getEntry(instance: FieryInstance, source: FierySource, optionsInput?: FieryOptionsInput, name?: string, namedSource?: boolean): FieryEntry;
export declare function updatePointers(entry: FieryEntry, querySnapshot: firebase.firestore.QuerySnapshot): void;
export declare function getChanges(querySnapshot: firebase.firestore.QuerySnapshot): firebase.firestore.DocumentChange[];
export declare function getEntryRecordFunctions(instance: FieryInstance): {
    refresh: (this: FieryData, cachedOnly?: boolean | undefined) => Promise<void>;
    sync: (this: FieryData, fields?: string | string[] | undefined) => Promise<void>;
    update: (this: FieryData, fields?: string | string[] | undefined) => Promise<void>;
    save: (this: FieryData, fields?: string | string[] | undefined) => Promise<void>;
    remove: (this: FieryData, excludeSubs?: boolean) => Promise<void>;
    ref: (this: FieryData, sub?: string | undefined) => FierySource;
    clear: (this: FieryData, props: FieryFields) => Promise<void[]>;
    build: <T extends FieryData>(this: FieryData, sub: string, initial?: FieryData | undefined) => T;
    create: <T extends FieryData>(this: FieryData, sub: string, initial?: FieryData | undefined) => T;
    getChanges: (this: FieryData, fieldsOrEquality: string | string[] | FieryEquality, equalityOrNothing?: FieryEquality | undefined) => Promise<FieryChanges>;
};
export declare function getEntryRecordProperties(options: FieryOptions, recordFunctions: any): FieryRecordProperties;
