
import * as firebase from 'firebase'


import { FierySystem, FieryOptions, FieryEntry, FieryData, FieryCacheEntry, FieryTarget } from '../types'
import { refreshData } from '../data'
import { getCacheForReference, removeDataFromEntry, destroyCache } from '../cache'
import { stats } from '../stats'
import { callbacks } from '../callbacks'



type OnSnapshot = (querySnapshot: firebase.firestore.DocumentSnapshot) => any
type OnResolve = (target: FieryTarget) => any
type OnReject = (reason: any) => any



export function factory (entry: FieryEntry): FieryData
{
  const source: firebase.firestore.DocumentReference = entry.source as firebase.firestore.DocumentReference
  const options: FieryOptions = entry.options
  const cache: FieryCacheEntry = getCacheForReference(entry, source, true)
  const initialTarget: FieryTarget | undefined = entry.target

  let missingSynchronously = false
  let resolve: OnResolve = () => {}
  let reject: OnReject = () => {}

  const onSnapshot = (doc: firebase.firestore.DocumentSnapshot) =>
  {
    options.onMutate(() =>
    {
        handleDocumentUpdate(cache, entry, doc)

        return cache.data
    })

    missingSynchronously = !doc.exists

    resolve(cache.data)

    return cache.data
  }

  if (initialTarget && initialTarget !== cache.data)
  {
    removeDataFromEntry(entry, initialTarget)
  }

  entry.target = cache.data

  stats.queries++

  if (options.once)
  {
    entry.promise = source.get(options.onceOptions)
      .then(onSnapshot)
      .catch(options.onError)
  }
  else
  {
    entry.promise = new Promise<FieryTarget>((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    })

    entry.off = source.onSnapshot(
      options.liveOptions,
      onSnapshot,
      (reason: any) => {
        reject(reason)
        options.onError(reason)
      }
    )
  }

  options.onPromise(entry.promise)

  if (missingSynchronously && options.nullifyMissing)
  {
    return (<any>null) as FieryData
  }

  return entry.target as FieryData
}

export function handleDocumentUpdate (cache: FieryCacheEntry, entry: FieryEntry, doc: firebase.firestore.DocumentSnapshot): void
{
  const options: FieryOptions = entry.options
  const system: FierySystem = entry.instance.system

  if (!doc.exists)
  {
    if (options.propExists)
    {
      system.setProperty(cache.data, options.propExists, false)
    }

    if (cache.exists === null)
    {
      callbacks.onDocumentMissing(cache.data, entry)

      options.triggerEvent(cache.data, 'missing')
    }
    else
    {
      options.triggerEvent(cache.data, 'remove')
    }

    cache.exists = false

    if (options.nullifyMissing)
    {
      destroyCache(cache)

      if (entry.name)
      {
        system.removeNamed(entry.name)
      }
    }
  }
  else
  {
    refreshData(cache, doc, entry)

    options.onSuccess(cache.data)

    callbacks.onDocumentUpdate(cache.data, entry)
  }
}

export default factory
