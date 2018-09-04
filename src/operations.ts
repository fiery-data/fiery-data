
import * as firebase from 'firebase'



import { FieryInstance, FieryCacheEntry, FieryOptions, FieryEntry, FieryData, FierySource, FieryChanges, FieryEquality, FieryFields, FieryTarget } from './types'
import { parseDocument, encodeData } from './data'
import { forEach, isEqual, isDefined, isFunction, isString, getFields } from './util'
import { getCacheForData, getCacheForReference } from './cache'
import { stats } from './stats'
import { callbacks } from './callbacks'



export function save (this: FieryInstance, data: FieryData, fields?: FieryFields): Promise<void>
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.ref)
  {
    const options: FieryOptions = cache.firstEntry.options
    const values: FieryData = encodeData(data, options, fields)

    if (cache.exists)
    {
      stats.writes++
      stats.updates++

      callbacks.onUpdate(data, values, cache)

      return cache.ref.update(values)
    }
    else
    {
      return cache.ref.get().then(doc =>
      {
        stats.writes++

        if (doc.exists)
        {
          stats.updates++

          callbacks.onUpdate(data, values, cache)

          return cache.ref.update(values)
        }
        else
        {
          const createValues = encodeData(data, options)

          stats.sets++

          callbacks.onSet(data, createValues, cache)

          return cache.ref.set(createValues)
        }
      })
    }
  }

  callbacks.onInvalidOperation(data, 'save')

  return Promise.reject('The given data is out of scope and cannot be operated on.')
}

export function update (this: FieryInstance, data: FieryData, fields?: FieryFields): Promise<void>
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.ref)
  {
    const options: FieryOptions = cache.firstEntry.options
    const values: FieryData = encodeData(data, options, fields)

    stats.writes++
    stats.updates++

    callbacks.onUpdate(data, values, cache)

    return cache.ref.update(values)
  }

  callbacks.onInvalidOperation(data, 'update')

  return Promise.reject('The given data is out of scope and cannot be operated on.')
}

export function sync (this: FieryInstance, data: FieryData, fields?: FieryFields): Promise<void>
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.ref)
  {
    const options: FieryOptions = cache.firstEntry.options
    const values: FieryData = encodeData(data, options, fields)

    stats.sets++
    stats.writes++

    callbacks.onSet(data, values, cache)

    return cache.ref.set(values)
  }

  callbacks.onInvalidOperation(data, 'sync')

  return Promise.reject('The given data is out of scope and cannot be operated on.')
}

export function remove (this: FieryInstance, data: FieryData, excludeSubs: boolean = false): Promise<void>
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.ref)
  {
    const options: FieryOptions = cache.firstEntry.options

    if (!excludeSubs && options.sub)
    {
      for (let subProp in options.sub)
      {
        forEach(data[subProp], (sub) =>
        {
          remove.call(this, sub as FieryData)
        })
      }
    }

    stats.deletes++

    callbacks.onDelete(data, cache)

    return cache.ref.delete()
  }

  callbacks.onInvalidOperation(data, 'remove')

  return Promise.reject('The given data is out of scope and cannot be operated on.')
}

export function clear (this: FieryInstance, data: FieryData, props: FieryFields): Promise<void[]>
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)
  const propsArray: string[] = getFields(props) as string[]

  if (cache && cache.ref)
  {
    const options: FieryOptions = cache.firstEntry.options
    const ref: firebase.firestore.DocumentReference = cache.ref
    const store: firebase.firestore.Firestore = ref.firestore
    const promises: Promise<void>[] = []

    const deleting: any = {}
    let deleteCount: number = 0

    for (let prop of propsArray)
    {
      if (options.sub && prop in options.sub && data[prop])
      {
        forEach(data[prop], (sub) =>
        {
          promises.push(remove.call(this, sub as FieryData))
        })
      }
      else if (prop in data)
      {
        let firebaseRuntime: any = (<any>store.app).firebase_

        if (firebaseRuntime)
        {
          deleting[prop] = firebaseRuntime.firestore.FieldValue.delete()
          deleteCount++
        }
      }
    }

    if (deleteCount > 0)
    {
      stats.updates++
      stats.writes++

      promises.push(ref.update(deleting))
    }

    callbacks.onClear(data, propsArray)

    return Promise.all(promises)
  }

  callbacks.onInvalidOperation(data, 'clear')

  return Promise.reject('The given data is out of scope and cannot be operated on.')
}

export function getChanges (this: FieryInstance,
  data: FieryData,
  fieldsOrEquality: FieryFields | FieryEquality,
  equalityOrNothing?: FieryEquality): Promise<FieryChanges>
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.ref)
  {
    const fields: FieryFields | undefined = isFunction(fieldsOrEquality) ? undefined : getFields(fieldsOrEquality as FieryFields)
    const equality: FieryEquality = ((fields ? equalityOrNothing : fieldsOrEquality) || isEqual) as FieryEquality
    const options: FieryOptions = cache.firstEntry.options
    const current: FieryData = encodeData(data, options, fields)

    stats.reads++

    callbacks.onGetChanges(data, cache, fields)

    return cache.ref.get().then(doc =>
    {
      const encoded: FieryData = parseDocument(doc, options)
      const remote: FieryData = {}
      const local: FieryData = {}
      let changed = false

      for (let prop in current)
      {
        let remoteValue = encoded[prop]
        let localValue = current[prop]

        if (!equality(remoteValue, localValue))
        {
          changed = true
          remote[prop] = remoteValue
          local[prop] = localValue
        }
      }

      return Promise.resolve({ changed, remote, local })
    })
  }

  callbacks.onInvalidOperation(data, 'getChanges')

  return Promise.reject('The given data is out of scope and cannot be operated on.')
}

export function ref (this: FieryInstance, data: FieryData, sub?: string): FierySource
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.ref)
  {
    const ref: firebase.firestore.DocumentReference = cache.ref

    return sub ? ref.collection(sub) : ref
  }

  throw 'The given data is out of scope and cannot be referenced.'
}

export function create <T extends FieryData>(this: FieryInstance, target: string | FieryTarget, initial?: FieryData): T
{
  const built: T = this.build(target, initial)

  if (built)
  {
    this.sync(built)
  }

  return built
}

export function createSub <T extends FieryData>(this: FieryInstance, data: FieryData, sub: string, initial?: FieryData): T
{
  const built: T = this.buildSub(data, sub, initial)

  if (built)
  {
    this.sync(built)
  }

  return built
}

export function build <T extends FieryData>(this: FieryInstance, target: string | FieryTarget, initial?: FieryData): T
{
  if (isString(target))
  {
    if (target in this.entry)
    {
      const entry: FieryEntry = this.entry[target]

      return buildFromCollection (entry.source as firebase.firestore.CollectionReference, entry, initial)
    }
  }
  else
  {
    const entry = this.entryFor(target)

    if (entry)
    {
      return buildFromCollection (entry.source as firebase.firestore.CollectionReference, entry, initial)
    }
  }

  throw 'Cannot build ' + target + + ', it does not exist in the current $fiery instance.'
}

export function buildSub <T extends FieryData>(this: FieryInstance, data: FieryData, sub: string, initial?: FieryData): T
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.ref && sub in cache.sub)
  {
    const entry: FieryEntry = cache.sub[sub]
    const ref: firebase.firestore.DocumentReference = cache.ref

    return buildFromCollection(ref.collection(sub), entry, initial)
  }

  throw 'Cannot build in the sub collection ' + sub + + ', the parent data does not exist in the current $fiery instance or the sub collection is not defined in the options.'
}

export function buildFromCollection <T extends FieryData>(collection: firebase.firestore.CollectionReference, entry: FieryEntry, initial?: FieryData): T
{
  const options: FieryOptions = entry.options
  const ref = collection.doc()
  const cache: FieryCacheEntry = getCacheForReference(entry, ref)

  if (options.defaults)
  {
    forEach(options.defaults, (defaultValue, prop) =>
    {
      if (!initial || !(prop in initial))
      {
        cache.data[prop] = isFunction(defaultValue) ? defaultValue() : defaultValue
      }
    })
  }

  if (initial)
  {
    forEach(initial, (value, prop) =>
    {
      cache.data[prop] = value
    })
  }

  callbacks.onBuild(cache.data, cache)

  return cache.data as T
}
