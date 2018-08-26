
import * as firebase from 'firebase'


import { FierySystem, FieryOptions, FieryEntry, FieryData, FieryCacheEntry, FieryTarget } from '../types'
import { refreshData } from '../data'
import { getCacheForReference, removeDataFromEntry, destroyCache } from '../cache'



type OnSnapshot = (querySnapshot: firebase.firestore.DocumentSnapshot) => any



export function factory (entry: FieryEntry): FieryData
{
  const source: firebase.firestore.DocumentReference = entry.source as firebase.firestore.DocumentReference
  const options: FieryOptions = entry.options
  const cache: FieryCacheEntry = getCacheForReference(entry, source)
  const initialTarget: FieryTarget | undefined = entry.target

  const onSnapshot = (doc: firebase.firestore.DocumentSnapshot) =>
  {
    handleDocumentUpdate(cache, entry, doc)
  }

  if (initialTarget && initialTarget !== cache.data)
  {
    removeDataFromEntry(entry, initialTarget)
  }

  entry.target = cache.data

  if (options.once)
  {
    entry.promise = source.get(options.onceOptions)
      .then(onSnapshot)
      .catch(options.onError)
  }
  else
  {
    entry.off = source.onSnapshot(
      options.liveOptions as firebase.firestore.DocumentListenOptions,
      onSnapshot,
      options.onError
    )
  }

  return entry.target as FieryData
}

export function handleDocumentUpdate (cache: FieryCacheEntry, entry: FieryEntry, doc: firebase.firestore.DocumentSnapshot): void
{
  const options: FieryOptions = entry.options
  const system: FierySystem = entry.instance.system

  if (!doc.exists)
  {
    destroyCache(cache)

    if (entry.name)
    {
      system.removeNamed(entry.name)
    }
  }
  else
  {
    refreshData(cache, doc, entry)

    options.onSuccess(cache.data)
  }
}

export default factory
