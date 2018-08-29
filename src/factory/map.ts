
import * as firebase from 'firebase'



import { PROP_UID } from '../constants'
import { FierySystem, FieryEntry, FieryTarget, FieryData, FieryOptions, FieryMap, FieryCacheEntry } from '../types'
import { forEach } from '../util'
import { refreshData } from '../data'
import { getCacheForDocument, removeDataFromEntry, removeCacheFromEntry, destroyCache } from '../cache'



type OnSnapshot = (querySnapshot: firebase.firestore.QuerySnapshot) => any



function factory (entry: FieryEntry): FieryMap
{
  type CollectionQuery = firebase.firestore.CollectionReference | firebase.firestore.Query
  const options: FieryOptions = entry.options
  const query: CollectionQuery = (options.query
    ? options.query(entry.source as firebase.firestore.CollectionReference)
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
      options.liveOptions,
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

  return (querySnapshot: firebase.firestore.QuerySnapshot) =>
  {
    const target: FieryMap = entry.target as FieryMap
    const missing: FieryMap = { ...target }

    querySnapshot.forEach((doc: firebase.firestore.DocumentSnapshot) =>
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

  return (querySnapshot: firebase.firestore.QuerySnapshot) =>
  {
    const target: FieryMap = entry.target as FieryMap

    (<any>querySnapshot).docChanges().forEach((change: firebase.firestore.DocumentChange) =>
    {
      const doc: firebase.firestore.DocumentSnapshot = change.doc
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
            if (options.propExists) {
              system.setProperty(cache.data, options.propExists, false)
            }
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

  return (querySnapshot: firebase.firestore.QuerySnapshot) =>
  {
    handler(querySnapshot)
    handler = handleUpdate
  }
}

export default factory
