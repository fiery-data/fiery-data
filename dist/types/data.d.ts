import * as firebase from 'firebase';
import { FierySystem, FieryOptions, FieryEntry, FieryData, FieryFields, FieryCacheEntry } from './types';
export declare function refreshData(cache: FieryCacheEntry, doc: firebase.firestore.DocumentSnapshot, entry: FieryEntry): FieryData;
export declare function copyData(system: FierySystem, data: FieryData, update: FieryData): FieryData;
export declare function decodeData(encoded: FieryData, options: FieryOptions): FieryData;
export declare function encodeData(data: FieryData, options: FieryOptions, fields?: FieryFields): FieryData;
export declare function parseDocument(doc: firebase.firestore.DocumentSnapshot, options: FieryOptions): FieryData;
