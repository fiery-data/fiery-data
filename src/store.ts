
import * as firebase from 'firebase'



import { FierySource } from './types'



export const stores = {

  keyNext: 0,

  map: { } as { [storeKey: number]: firebase.firestore.Firestore },

  idToKey: { } as { [id: string]: number }

}

export function getStoreKey (source: FierySource): number
{
  const firestore: firebase.firestore.Firestore = source.firestore
  const id: string = firestore.app.name
  let key: number = stores.idToKey[id]

  if (!key)
  {
    key = ++stores.keyNext
    stores.map[key] = firestore
    stores.idToKey[id] = key
  }

  return key
}
