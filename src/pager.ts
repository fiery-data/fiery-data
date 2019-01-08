
import * as firebase from 'firebase'


import { FieryEntry, FieryPager, FieryTarget } from './types'
import { isArray, isObject } from './util'



export function getPager(entry: FieryEntry): FieryPager
{
  let pointer: firebase.firestore.DocumentSnapshot | undefined

  const pager: FieryPager =
  {
    index: 0,

    hasQuery(): boolean
    {
      return !!(entry.query && entry.requery)
    },

    hasData(): boolean
    {
      const target = entry.target

      if (isArray(target))
      {
        return target.length > 0
      }

      if (isObject(target))
      {
        for (let _prop in target)
        {
          return true
        }
      }

      return false
    },

    hasNext(): boolean
    {
      return this.hasQuery() && this.hasData()
    },

    hasPrev(): boolean
    {
      return this.hasQuery() && this.index > 0
    },

    next(): Promise<FieryTarget>
    {
      const { query, requery, last, first, off } = entry

      if (query && requery && last && this.hasData())
      {
        if (off) off()

        delete entry.off
        delete entry.last

        this.index++
        pointer = first

        requery(query.startAfter(last))

        if (entry.promise) return entry.promise
      }

      return Promise.reject('The pager could not execute next')
    },

    prev(): Promise<FieryTarget>
    {
      const { query, requery, first, off, options } = entry

      if (query && requery && (first || pointer) && this.index > 0)
      {
        if (off) off()

        delete entry.off

        this.index--

        if (first && options.queryReverse)
        {
          delete entry.first

          options.queryReverse(entry.source as firebase.firestore.CollectionReference)
            .startAfter(first)
            .get(options.onceOptions)
            .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
              const last = querySnapshot.docs[querySnapshot.docs.length - 1];
              requery(query.startAt(last))
            })
        }
        else
        {
          requery(query.startAt(pointer))

          pointer = undefined
        }

        if (entry.promise) return entry.promise
      }

      return Promise.reject('The pager could not execute prev')
    }
  }

  return pager
}
