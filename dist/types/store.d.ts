import * as firebase from 'firebase';
import { FierySource } from './types';
export declare const stores: {
    keyNext: number;
    map: {
        [storeKey: number]: firebase.firestore.Firestore;
    };
    idToKey: {
        [id: string]: number;
    };
};
export declare function getStoreKey(source: FierySource): number;
