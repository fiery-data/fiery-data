

import { FierySystem, FieryOptionsInput, FieryEntryMap, FieryOptions, FieryInstance, FieryEntry, FierySources, FierySource, FieryCache, FieryData, FieryChanges, FieryEquality, FieryFields, FieryRecordProperties } from './types'
import { isCollectionSource, forEach, isDefined } from './util'
import { getOptions, recycleOptions } from './options'
import { getStoreKey } from './store'
import { removeCacheFromEntry } from './cache'
import * as operations from './operations'



export function closeEntry (entry: FieryEntry | null, remove: boolean = false): void
{
  if (entry && entry.live)
  {
    if (entry.off)
    {
      entry.off()

      delete entry.off
    }

    entry.live = false

    if (remove)
    {
      const instance: FieryInstance = entry.instance

      if (isDefined(entry.index))
      {
        instance.entryList[entry.index as number] = null

        delete entry.index
      }

      if (entry.name && entry.name in instance.entry)
      {
        delete instance.entry[entry.name]
      }

      forEach(entry.children, cached =>
      {
        removeCacheFromEntry(entry, cached)
      })
    }
  }
}

export function getEntry (instance: FieryInstance, source: FierySource, optionsInput?: FieryOptionsInput, name?: string, namedSource: boolean = true)
{
  // Things that are allowed to change on repetitive entry calls
  const options: FieryOptions = getOptions(optionsInput, instance)
  const storeKey: number = getStoreKey(source)

  if (name && name in instance.entry)
  {
    const existing: FieryEntry = instance.entry[ name ]

    closeEntry(existing)

    if (options.id !== existing.options.id)
    {
      recycleOptions(existing.options)
    }

    existing.source = source
    existing.options = options
    existing.storeKey = storeKey
    existing.live = true

    if (name && namedSource)
    {
      instance.sources[ name ] = source
    }

    return existing
  }

  const recordFunctions = getEntryRecordFunctions(instance)
  const recordProperties = getEntryRecordProperties(options, recordFunctions)
  const children: FieryCache = {}
  const live: boolean = true
  const entry: FieryEntry = {
    name,
    options,
    source,
    instance,
    storeKey,
    children,
    recordFunctions,
    recordProperties,
    live
  }

  if (!name || !(name in instance.entry))
  {
    entry.index = instance.entryList.length

    instance.entryList.push(entry)
  }

  if (name)
  {
    instance.entry[ name ] = entry
  }

  if (name && namedSource)
  {
    instance.sources[ name ] = source
  }

  return entry
}

export function getEntryRecordFunctions (instance: FieryInstance)
{
  return {
    sync: function(this: FieryData, fields?: FieryFields): Promise<void> {
      return operations.sync.call(instance, this, fields)
    },
    update: function(this: FieryData, fields?: FieryFields): Promise<void> {
      return operations.update.call(instance, this, fields)
    },
    remove: function(this: FieryData, excludeSubs: boolean = false): Promise<void> {
      return operations.remove.call(instance, this, excludeSubs)
    },
    ref: function(this: FieryData, sub?: string): FierySource {
      return operations.ref.call(instance, this, sub)
    },
    clear: function(this: FieryData, props: FieryFields): Promise<void[]> {
      return operations.clear.call(instance, this, props)
    },
    build: function<T extends FieryData>(this: FieryData, sub: string, initial?: FieryData): T {
      return operations.buildSub.call(instance, this, sub, initial)
    },
    create: function<T extends FieryData>(this: FieryData, sub: string, initial?: FieryData): T {
      return operations.createSub.call(instance, this, sub, initial)
    },
    getChanges: function(this: FieryData,
      fieldsOrEquality: FieryFields | FieryEquality,
      equalityOrNothing?: FieryEquality): Promise<FieryChanges> {
      return operations.getChanges.call(instance, this, fieldsOrEquality, equalityOrNothing)
    }
  }
}

export function getEntryRecordProperties (options: FieryOptions, recordFunctions: any): FieryRecordProperties
{
  const props: FieryRecordProperties = {}

  for (var prop in options.recordOptions)
  {
    const newProp = options.recordOptions[prop]

    props[newProp] = {
      value: recordFunctions[prop]
    }
  }

  return props
}
