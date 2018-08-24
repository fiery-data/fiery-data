import * as firebase from 'firebase';
import { FieryEntry, FieryData, FieryCacheEntry } from '../types';
declare type DocumentSnapshot = firebase.firestore.DocumentSnapshot;
export declare function factory(entry: FieryEntry): FieryData;
export declare function handleDocumentUpdate(cache: FieryCacheEntry, entry: FieryEntry, doc: DocumentSnapshot): void;
export default factory;
