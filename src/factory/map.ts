
import * as firebase from 'firebase'



import { PROP_UID } from '../constants'
import { FierySystem, FieryEntry, FieryTarget, FieryData, FieryOptions, FieryMap, FieryCacheEntry } from '../types'
import { forEach } from '../util'
import { refreshData } from '../data'
import { getCacheForDocument, removeDataFromEntry, removeCacheFromEntry, destroyCache } from '../cache'



type Query = firebase.firestore.Query
type QuerySnapshot = firebase.firestore.QuerySnapshot
type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type DocumentChange = firebase.firestore.DocumentChange
type CollectionReference = firebase.firestore.CollectionReference
type QueryListenOptions = firebase.firestore.QueryListenOptions



type OnSnapshot = (querySnapshot: QuerySnapshot) => any



function factory (entry: FieryEntry): FieryMap
{
  type CollectionQuery = CollectionReference | Query
  const options: FieryOptions = entry.options
  const query: CollectionQuery = (options.query
    ? options.query(entry.source as CollectionReference)
    : entry.source) as CollectionQuery
  const initial = getInitialHandler(entry)

  if (!entry.target)
  {
    entry.target = options.newCollection()
  }

  if (options.once)
  {
    entry.promise = query.get(options.onceOptions)
      .then(initial)
      .catch(options.onError)
  }
  else
  {
    entry.off = query.onSnapshot(
      options.liveOptions as QueryListenOptions,
      getLiveHandler(entry, initial),
      options.onError
    )
  }

  return entry.target as FieryMap
}

function getInitialHandler (entry: FieryEntry): OnSnapshot
{
  const options: FieryOptions = entry.options
  const system: FierySystem = entry.instance.system

  return (querySnapshot: QuerySnapshot) =>
  {
    const target: FieryMap = entry.target as FieryMap
    const missing: FieryMap = { ...target }

    querySnapshot.forEach((doc: DocumentSnapshot) =>
    {
      const cache: FieryCacheEntry = getCacheForDocument(entry, doc)

      refreshData(cache, doc, entry)

      system.setProperty(target, doc.id, cache.data)

      delete missing[doc.id]

    }, options.onError)

    forEach(missing, (missed, key) => system.removeProperty(target, key as string))
    forEach(missing, missed => removeDataFromEntry(entry, missed))

    options.onSuccess(target)
  }
}

function getUpdateHandler (entry: FieryEntry): OnSnapshot
{
  const options: FieryOptions = entry.options
  const system: FierySystem = entry.instance.system

  return (querySnapshot: QuerySnapshot) =>
  {
    const target: FieryMap = entry.target as FieryMap

    (<any>querySnapshot).docChanges().forEach((change: DocumentChange) =>
    {
      const doc: DocumentSnapshot = change.doc
      const cache: FieryCacheEntry = getCacheForDocument(entry, doc)

      switch (change.type) {
        case 'modified':
        case 'added':
          const data: FieryData = refreshData(cache, doc, entry)
          system.setProperty(target, doc.id, data)
          break
        case 'removed':
          system.removeProperty(target, doc.id)
          if (doc.exists) {
            removeCacheFromEntry(entry, cache)
          } else {
            destroyCache(cache)
          }
          break
      }
    }, options.onError)

    options.onSuccess(target)
  }
}

function getLiveHandler (entry: FieryEntry, handleInitial: OnSnapshot): OnSnapshot
{
  const handleUpdate: OnSnapshot = getUpdateHandler(entry)
  let handler: OnSnapshot = handleInitial

  return (querySnapshot: QuerySnapshot) =>
  {
    handler(querySnapshot)
    handler = handleUpdate
  }
}

export default factory
