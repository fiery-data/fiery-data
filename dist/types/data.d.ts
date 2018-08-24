import * as firebase from 'firebase';
import { FierySystem, FieryOptions, FieryEntry, FieryData, FieryFields, FieryCacheEntry } from './types';
declare type DocumentSnapshot = firebase.firestore.DocumentSnapshot;
export declare function refreshData(cache: FieryCacheEntry, doc: DocumentSnapshot, entry: FieryEntry): FieryData;
export declare function copyData(system: FierySystem, data: FieryData, update: FieryData): FieryData;
export declare function decodeData(encoded: FieryData, options: FieryOptions): FieryData;
export declare function encodeData(data: FieryData, options: FieryOptions, fields?: FieryFields): FieryData;
export declare function parseDocument(doc: DocumentSnapshot, options: FieryOptions): FieryData;
export {};
