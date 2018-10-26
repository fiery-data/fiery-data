
import * as firebase from 'firebase'


import { PROP_UID } from '../constants'
import { FierySystem, FieryEntry, FieryTarget, FieryData, FieryOptions, FieryMap, FieryCacheEntry } from '../types'
import { refreshData } from '../data'
import { getCacheForDocument, removeCacheFromEntry, removeDataFromEntry, destroyCache } from '../cache'
import { forEach } from '../util'
import { updatePointers, getChanges } from '../entry'
import { stats } from '../stats'
import { callbacks } from '../callbacks'



export type OnSnapshot = (querySnapshot: firebase.firestore.QuerySnapshot) => any
export type OnResolve = (target: FieryTarget) => any
export type OnReject = (reason: any) => any


export function factory (entry: FieryEntry): FieryData[]
{
  type CollectionQuery = firebase.firestore.CollectionReference | firebase.firestore.Query
  const options: FieryOptions = entry.options
  const query: CollectionQuery = (options.query
    ? options.query(entry.source as firebase.firestore.CollectionReference)
    : entry.source) as CollectionQuery

  entry.requery = (query) =>
  {
    const initial = getInitialHandler(entry)

    if (!entry.target)
    {
      entry.target = options.newCollection()
    }

    stats.queries++

    if (options.once)
    {
      entry.promise = query.get(options.onceOptions)
        .then(initial)
        .catch(options.onError)
    }
    else
    {
      let resolve: OnResolve = () => {}
      let reject: OnReject = () => {}

      entry.promise = new Promise<FieryTarget>((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
      })

      entry.off = query.onSnapshot(
        options.liveOptions,
        getLiveHandler(entry, initial, resolve),
        (reason: any) => {
          reject(reason)
          options.onError(reason)
        }
      )
    }
  }

  entry.requery(entry.query = query)

  return entry.target as FieryData[]
}

export function getInitialHandler (entry: FieryEntry): OnSnapshot
{
  const options: FieryOptions = entry.options
  const system: FierySystem = entry.instance.system
  const initialTarget: FieryTarget | undefined = entry.target

  return (querySnapshot: firebase.firestore.QuerySnapshot) =>
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

    options.onMutate(() =>
    {
      system.arrayResize(target, 0)

      querySnapshot.forEach((doc: firebase.firestore.DocumentSnapshot) =>
      {
        const cache: FieryCacheEntry = getCacheForDocument(entry, doc, true)

        refreshData(cache, doc, entry)

        system.arrayAdd(target, cache.data)

        delete missing[cache.uid]

        callbacks.onCollectionAdd(cache.data, target, entry)

      }, options.onError)

      return target
    })

    forEach(missing, data =>
    {
      callbacks.onCollectionRemove(data, target, entry)

      removeDataFromEntry(entry, data)
    })

    options.onSuccess(target)

    updatePointers(entry, querySnapshot)

    callbacks.onCollectionChanged(target, entry)

    return target
  }
}

export function getUpdateHandler (entry: FieryEntry): OnSnapshot
{
  const options: FieryOptions = entry.options
  const system: FierySystem = entry.instance.system

  return (querySnapshot: firebase.firestore.QuerySnapshot) =>
  {
    const target: FieryData[] = entry.target as FieryData[]

    options.onMutate(() =>
    {
      const changes = getChanges(querySnapshot)

      changes.forEach((change: firebase.firestore.DocumentChange) =>
      {
        const doc: firebase.firestore.DocumentSnapshot = change.doc
        const cache: FieryCacheEntry = getCacheForDocument(entry, doc)

        switch (change.type)
        {
          case 'added':
            const created: FieryData = refreshData(cache, doc, entry)
            system.arrayInsert(target, change.newIndex, created)

            callbacks.onCollectionAdd(created, target, entry)
            break

          case 'removed':
            system.arrayRemove(target, change.oldIndex)

            callbacks.onCollectionRemove(cache.data, target, entry)

            if (doc.exists)
            {
              removeCacheFromEntry(entry, cache)
            }
            else
            {
              if (options.propExists)
              {
                system.setProperty(cache.data, options.propExists, false)
              }

              cache.exists = false

              options.triggerEvent(cache.data, 'remove')

              destroyCache(cache)
            }
            break

          case 'modified':
            const updated: FieryData = refreshData(cache, doc, entry)

            if (change.oldIndex !== change.newIndex)
            {
              system.arrayMove(target, change.oldIndex, change.newIndex, updated)
            }

            callbacks.onCollectionModify(updated, target, entry)
            break
        }
      }, options.onError)

      system.arrayResize(target, querySnapshot.size)

      return target
    })

    options.onSuccess(target)

    updatePointers(entry, querySnapshot)

    callbacks.onCollectionChanged(target, entry)
  }
}

export function getLiveHandler (entry: FieryEntry, handleInitial: OnSnapshot, resolve: OnResolve): OnSnapshot
{
  const handleUpdate: OnSnapshot = getUpdateHandler(entry)
  let handler: OnSnapshot = handleInitial

  return (querySnapshot: firebase.firestore.QuerySnapshot) =>
  {
    handler(querySnapshot)
    resolve(entry.target as FieryTarget)
    handler = handleUpdate
  }
}

export default factory
