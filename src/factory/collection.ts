
import * as firebase from 'firebase'


import { PROP_UID } from '../constants'
import { FierySystem, FieryEntry, FieryTarget, FieryData, FieryOptions, FieryMap, FieryCacheEntry } from '../types'
import { refreshData } from '../data'
import { getCacheForDocument, removeCacheFromEntry, removeDataFromEntry, destroyCache } from '../cache'
import { forEach } from '../util'



type Query = firebase.firestore.Query
type QuerySnapshot = firebase.firestore.QuerySnapshot
type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot
type DocumentChange = firebase.firestore.DocumentChange
type CollectionReference = firebase.firestore.CollectionReference
type QueryListenOptions = firebase.firestore.QueryListenOptions



type OnSnapshot = (querySnapshot: QuerySnapshot) => any



export function factory (entry: FieryEntry): FieryData[]
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

  return entry.target as FieryData[]
}

function getInitialHandler (entry: FieryEntry): OnSnapshot
{
  const options: FieryOptions = entry.options
  const system: FierySystem = entry.instance.system
  const initialTarget: FieryTarget | undefined = entry.target

  return (querySnapshot: QuerySnapshot) =>
  {
    const target: FieryData[] = entry.target as FieryData[]
    const missing: FieryMap = {}

    if (initialTarget)
    {
      for (let i = 0; i < target.length; i++)
      {
        const data = target[i]
        missing[data[PROP_UID]] = data
      }
    }

    system.arrayResize(target, 0)

    querySnapshot.forEach((doc: DocumentSnapshot) =>
    {
      const cache: FieryCacheEntry = getCacheForDocument(entry, doc)

      refreshData(cache, doc, entry)

      system.arrayAdd(target, cache.data)

      delete missing[cache.uid]

    }, options.onError)

    forEach(missing, value => removeDataFromEntry(entry, value))

    options.onSuccess(target)
  }
}

function getUpdateHandler (entry: FieryEntry): OnSnapshot
{
  const options: FieryOptions = entry.options
  const system: FierySystem = entry.instance.system

  return (querySnapshot: QuerySnapshot) =>
  {
    const target: FieryData[] = entry.target as FieryData[]

    (<any>querySnapshot).docChanges().forEach((change: DocumentChange) =>
    {
      const doc: DocumentSnapshot = change.doc
      const cache: FieryCacheEntry = getCacheForDocument(entry, doc)

      switch (change.type)
      {
        case 'added':
          const created: FieryData = refreshData(cache, doc, entry)
          system.arraySet(target, change.newIndex, created)
          break

        case 'removed':
          if (doc.exists) {
            removeCacheFromEntry(entry, cache)
          } else {
            destroyCache(cache)
          }
          break

        case 'modified':
          const updated: FieryData = refreshData(cache, doc, entry)

          if (change.oldIndex !== change.newIndex) {
            system.arraySet(target, change.newIndex, updated)
          }
          break
      }
    }, options.onError)

    system.arrayResize(target, querySnapshot.size)

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
