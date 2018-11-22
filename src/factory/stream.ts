
import * as firebase from 'firebase'


import { FieryEntry, FieryTarget, FieryData, FieryOptions } from '../types'
import { updatePointers } from '../entry'
import { stats } from '../stats'

import {
  getInitialHandler as getCollectionInitialHandler,
  getUpdateHandler as getCollectionUpdateHandler,
  getLiveHandler as getCollectionLiveHandler
} from './collection'

import {
  getInitialHandler as getMapInitialHandler,
  getUpdateHandler as getMapUpdateHandler,
  getLiveHandler as getMapLiveHandler
} from './map'


type OnSnapshot = (querySnapshot: firebase.firestore.QuerySnapshot) => any
type OnResolve = (target: FieryTarget) => any
type OnReject = (reason: any) => any

export function factory (entry: FieryEntry): FieryData[]
{
  const options: FieryOptions = entry.options

  if (!options.query) {
    throw 'query is required for streaming'
  }
  if (!options.streamInitial) {
    throw 'streamInitial is required for streaming'
  }

  const query: firebase.firestore.Query =
    options.query(entry.source as firebase.firestore.CollectionReference) as
      firebase.firestore.Query

  entry.requery = (query) =>
  {
    const initial: OnSnapshot = options.map
      ? getMapInitialHandler(entry)
      : getCollectionInitialHandler(entry)

    if (!entry.target)
    {
      entry.target = options.newCollection()
    }

    stats.queries++

    entry.promise = query
      .limit(options.streamInitial as number)
      .get(options.onceOptions)
      .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
        stats.queries++
        initial(querySnapshot)
        startStream(entry, initial, query)
      })
      .catch(options.onError)
  }

  entry.more = (count?: number) =>
  {
    const limit: number = (count || options.streamMore) as number

    if (!limit || limit < 0) {
      throw 'streamMore is required for streaming'
    }

    const initial: OnSnapshot = options.map
      ? getMapInitialHandler(entry)
      : getCollectionInitialHandler(entry)

    return query
      .startAfter(entry.last)
      .limit(limit)
      .get(options.onceOptions)
      .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
        stats.queries++
        updatePointers(entry, querySnapshot)
        startStream(entry, initial, query)
      })
      .catch(options.onError)
  }

  entry.requery(entry.query = query)

  return entry.target as FieryData[]
}

function startStream (entry: FieryEntry, initial: OnSnapshot, query: firebase.firestore.Query)
{
  const options: FieryOptions = entry.options

  let resolve: OnResolve = () => {}
  let reject: OnReject = () => {}

  entry.promise = new Promise<FieryTarget>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  const live = options.map
    ? getMapLiveHandler(entry, initial, resolve)
    : getCollectionLiveHandler(entry, initial, resolve)

  if (entry.off) {
    entry.off()
  }

  entry.off = query.endAt(entry.last).onSnapshot(
    options.liveOptions,
    live,
    (reason: any) => {
      reject(reason)
      options.onError(reason)
    }
  )

  options.onPromise(entry.promise)
}

export default factory
