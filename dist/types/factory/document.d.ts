import * as firebase from 'firebase';
import { FieryEntry, FieryData, FieryCacheEntry } from '../types';
export declare function factory(entry: FieryEntry): FieryData;
export declare function handleDocumentUpdate(cache: FieryCacheEntry, entry: FieryEntry, doc: firebase.firestore.DocumentSnapshot): void;
export default factory;
