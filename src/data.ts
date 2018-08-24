
import * as firebase from 'firebase'



import { FierySource, FierySystem, FieryOptions, FieryInstance, FieryEntry, FieryData, FieryMap, FieryFields, FieryCacheEntry } from './types'
import { isObject, getFields } from './util'



type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type DocumentReference = firebase.firestore.DocumentReference
type Firestore = firebase.firestore.Firestore



export function refreshData (cache: FieryCacheEntry, doc: DocumentSnapshot, entry: FieryEntry): FieryData
{
  const system: FierySystem = entry.instance.system
  const options: FieryOptions = entry.options
  const encoded: FieryData = parseDocument(doc, options)
  const decoded: FieryData = decodeData(encoded, options)
  const data: FieryData = cache.data

  copyData(system, data, decoded)

  return data;
}

export function copyData (system: FierySystem, data: FieryData, update: FieryData): FieryData
{
  for (let prop in update)
  {
    system.setProperty(data, prop, update[prop])
  }

  return data
}

export function decodeData (encoded: FieryData, options: FieryOptions): FieryData
{
  if (options.decode)
  {
    encoded = options.decode(encoded)
  }
  else if (options.decoders)
  {
    for (let prop in options.decoders)
    {
      if (prop in encoded)
      {
        encoded[prop] = options.decoders[prop](encoded[prop], encoded)
      }
    }
  }

  return encoded
}

export function encodeData (data: FieryData, options: FieryOptions, fields?: FieryFields): FieryData
{
  const values: FieryData = {}
  const explicit: string[] = getFields(fields, options.include) as string[]

  if (explicit)
  {
    for (let i = 0; i < explicit.length; i++)
    {
      let prop: string = explicit[i]

      if (prop in data)
      {
        values[prop] = data[prop]
      }
    }
  }
  else
  {
    for (let prop in data)
    {
      if (!(prop in options.exclude))
      {
        values[prop] = data[prop]
      }
    }
  }

  if (options.encoders)
  {
    for (let prop in options.encoders)
    {
      if (prop in values)
      {
        values[prop] = options.encoders[prop](values[prop], data)
      }
    }
  }

  return values
}

export function parseDocument (doc: DocumentSnapshot, options: FieryOptions): FieryData
{
  let value = doc.data()
  let out = (isObject(value) ? value : { [options.propValue]: value }) as FieryData

  if (out && options.key)
  {
    out[options.key] = doc.id
  }

  return out
}
