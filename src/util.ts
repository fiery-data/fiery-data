
import * as firebase from 'firebase'



import { FieryOptions, FierySource, FieryData, FieryMetadata, FieryEntry, FieryFields } from './types'
import { getOptionsByKey } from './options'



export function isObject (x?: any): x is Object
{
  return Object.prototype.toString.call(x) === '[object Object]'
}

export function isFunction (x?: any): x is Function
{
  return typeof x === 'function'
}

export function isString (x?: any): x is string
{
  return typeof x === 'string'
}

export function isArray (x?: any): x is Array<any>
{
  return x && x instanceof Array
}

export function isDate (x?: any): x is Date
{
  return x && x instanceof Date
}

export function isDefined (x?: any): boolean
{
  return typeof x !== 'undefined'
}

export function coalesce (a?: any, b?: any): any
{
  return isDefined(a) ? a : b
}

export function isCollectionSource (source: FierySource): boolean
{
  return !!((<any>source).where)
}

export function getFields (fields?: FieryFields, otherwise?: string[]): string[] | undefined
{
  return !fields ? otherwise : (isString(fields) ? [fields] : fields)
}

// export function forEach<I, V extends I[keyof I], K extends keyof I>(iterable: I, callback: (item: V, key: K, iterable: I) => any): boolean
// export function forEach<V, K>(iterable: V[], callback: (item: V, key: K, iterable: V[]) => any): boolean
export function forEach(iterable: any, callback: (item: any, key: any, iterable: any) => any): boolean
{
  if (isArray(iterable))
  {
    for (let i = 0; i < iterable.length; i++)
    {
      callback(iterable[i], i, iterable)
    }

    return true
  }
  else if (isObject(iterable))
  {
    for (let prop in iterable)
    {
      if (iterable.hasOwnProperty(prop))
      {
        callback(iterable[prop], prop, iterable)
      }
    }

    return true
  }

  return false
}

export function isEqual (a: any, b: any): boolean
{
  if (a === b)
  {
    return true
  }

  if (!a || !b)
  {
    return false
  }

  if (typeof a !== typeof b)
  {
    return false
  }

  if (isArray(a) && isArray(b))
  {
    if (a.length !== b.length)
    {
      return false
    }

    for (let i = 0; i < a.length; i++)
    {
      if (!isEqual(a[i], b[i]))
      {
        return false
      }
    }

    return true
  }

  if (isDate(a) && isDate(b))
  {
    return a.getTime() === b.getTime()
  }

  if (isObject(a) && isObject(b))
  {
    for (let prop in a)
    {
      if (!isEqual(a[prop], b[prop]))
      {
        return false
      }
    }

    for (let prop in b)
    {
      if (!(prop in a))
      {
        return false
      }
    }

    return true
  }

  return false
}
