import * as firebase from 'firebase';
export declare type FieryData = {
    [prop: string]: any;
};
export declare type FieryMap = {
    [key: string]: FieryData;
};
export declare type FieryTarget = FieryData[] | FieryData | FieryMap;
export declare type FieryExclusions = {
    [field: string]: boolean;
};
export declare type FierySource = firebase.firestore.Query | firebase.firestore.DocumentReference;
export declare type FierySources = {
    [name: string]: FierySource;
};
export declare type FieryEntryMap = {
    [key: string]: FieryEntry;
};
export declare type FieryChanges = {
    changed: boolean;
    remote: FieryData;
    local: FieryData;
};
export declare type FieryEquality = (a: any, b: any) => boolean;
export declare type FieryMergeStrategy = (a: any, b: any) => any;
export declare type FieryMergeStrategies = {
    [option: string]: FieryMergeStrategy;
};
export declare type FieryOptionsMap = {
    [name: string]: Partial<FieryOptions>;
};
export declare type FieryOptionsInput = string | Partial<FieryOptions>;
export declare type FieryFields = string | string[];
export declare type FieryCache = {
    [uid: string]: FieryCacheEntry;
};
export interface FierySystem {
    removeNamed: (name: string) => any;
    setProperty: (target: any, property: string, value: any) => any;
    removeProperty: (target: any, property: string) => any;
    arraySet: (target: any[], index: number, value: any) => any;
    arrayAdd: (target: any[], value: any) => any;
    arrayResize: (target: any[], size: number) => any;
}
export interface FieryOptions {
    extends?: FieryOptionsInput;
    id: number;
    shared: boolean;
    instance?: FieryInstance;
    key?: string;
    query?: (source: firebase.firestore.CollectionReference) => firebase.firestore.Query;
    map?: boolean;
    doc?: boolean;
    ref?: boolean;
    once?: boolean;
    nullifyMissing?: boolean;
    type?: {
        new (): FieryData;
    };
    newDocument: (encoded?: FieryData) => FieryData;
    newCollection: () => FieryMap | FieryData[];
    decode?: (encoded: FieryData) => FieryData;
    decoders?: {
        [prop: string]: (a: any, encoded: FieryData) => any;
    };
    encoders?: {
        [prop: string]: (a: any, data: FieryData) => any;
    };
    defaults: {
        [prop: string]: any | (() => any);
    };
    timestamps?: string[];
    record?: boolean;
    recordOptions: {
        sync?: string;
        update?: string;
        save?: string;
        remove?: string;
        ref?: string;
        clear?: string;
        build?: string;
        create?: string;
        getChanges?: string;
        [unspecified: string]: any;
    };
    exclude: FieryExclusions | string[];
    include: string[];
    parent?: FieryOptions;
    sub?: {
        [subProp: string]: FieryOptionsInput;
    };
    propValue: string;
    propExists?: string;
    propParent?: string;
    onceOptions?: firebase.firestore.GetOptions;
    liveOptions: firebase.firestore.SnapshotListenOptions;
    onError: (error: any) => any;
    onSuccess: (target: FieryTarget) => any;
    onMissing: () => any;
    onRemove: () => any;
    onMutate: (mutate: () => FieryTarget) => void;
}
export interface FieryInstance {
    <T extends FieryTarget>(source: FierySource, options?: FieryOptionsInput, name?: string): T;
    system: FierySystem;
    options: {
        [optionKey: number]: FieryOptions;
    };
    sources: {
        [name: string]: FierySource;
    };
    entry: FieryEntryMap;
    entryList: (FieryEntry | null)[];
    entryFor: (target: string | FieryTarget) => FieryEntry | null;
    cache: FieryCache;
    destroy: () => void;
    free: (target: FieryTarget) => void;
    linkSources: (container: any) => void;
    pager: (target: string | FieryTarget) => FieryPager | null;
    refresh: (data: FieryData, cachedOnly?: boolean) => Promise<void>;
    update: (data: FieryData, fields?: FieryFields) => Promise<void>;
    save: (data: FieryData, fields?: FieryFields) => Promise<void>;
    sync: (data: FieryData, fields?: FieryFields) => Promise<void>;
    remove: (data: FieryData) => Promise<void>;
    clear: (data: FieryData, props: FieryFields) => Promise<void[]>;
    getChanges: (data: FieryData, fieldsOrEquality: FieryFields | FieryEquality, equalityOrNothing?: FieryEquality) => Promise<FieryChanges>;
    ref: (data: FieryData) => FierySource;
    create: <T extends FieryData>(target: string | FieryTarget, initial?: FieryData) => T;
    createSub: <T extends FieryData>(data: FieryData, sub: string, initial?: FieryData) => T;
    build: <T extends FieryData>(target: string | FieryTarget, initial?: FieryData) => T;
    buildSub: <T extends FieryData>(data: FieryData, sub: string, initial?: FieryData) => T;
}
export interface FieryMetadata {
    uid: string;
    path: string;
    storeKey: number;
    store: firebase.firestore.Firestore;
    optionKey: string;
    options: FieryOptions;
}
export declare type FieryRecordRefresh = (cachedOnly?: boolean) => Promise<void>;
export declare type FieryRecordSync = (fields?: FieryFields) => Promise<void>;
export declare type FieryRecordUpdate = (fields?: FieryFields) => Promise<void>;
export declare type FieryRecordSave = (fields?: FieryFields) => Promise<void>;
export declare type FieryRecordRemove = (excludeSubs: boolean) => Promise<void>;
export declare type FieryRecordRef = (sub?: string) => FierySource;
export declare type FieryRecordClear = (props: FieryFields) => Promise<void[]>;
export declare type FieryRecordCreate = <T extends FieryData>(sub: string, initial?: FieryData) => T;
export declare type FieryRecordBuild = <T extends FieryData>(sub: string, initial?: FieryData) => T;
export declare type FieryRecordChanges = (fieldsOrEquality: FieryFields | FieryEquality, equalityOrNothing?: FieryEquality) => Promise<FieryChanges>;
export declare type FieryRecordProperties = {
    [prop: string]: {
        value: any;
    };
};
export interface FieryPager {
    index: number;
    hasQuery(): boolean;
    hasData(): boolean;
    hasNext(): boolean;
    hasPrev(): boolean;
    next(): boolean;
    prev(): boolean;
}
export interface FieryEntry {
    name?: string;
    options: FieryOptions;
    source: FierySource;
    instance: FieryInstance;
    storeKey: number;
    target?: FieryTarget;
    parent?: FieryCacheEntry;
    children: FieryCache;
    recordFunctions: {
        sync: FieryRecordSync;
        update: FieryRecordUpdate;
        save: FieryRecordSave;
        refresh: FieryRecordRefresh;
        remove: FieryRecordRemove;
        ref: FieryRecordRef;
        clear: FieryRecordClear;
        create: FieryRecordCreate;
        build: FieryRecordBuild;
        getChanges: FieryRecordChanges;
    };
    recordProperties: FieryRecordProperties;
    promise?: Promise<firebase.firestore.QuerySnapshot>;
    last?: firebase.firestore.DocumentSnapshot;
    first?: firebase.firestore.DocumentSnapshot;
    query?: firebase.firestore.Query;
    requery?: (query: firebase.firestore.Query) => void;
    pager?: FieryPager;
    off?: () => any;
    id?: number;
    index?: number;
    live: boolean;
}
export interface FieryCacheEntry {
    uid: string;
    exists: boolean;
    data: FieryData;
    ref: firebase.firestore.DocumentReference;
    uses: number;
    sub: FieryEntryMap;
    firstEntry: FieryEntry;
    entries: FieryEntry[];
    removed: boolean;
}
