
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
        for (let prop in target)
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
      const { query, requery, first, off } = entry

      if (query && requery && (first || pointer) && this.index > 0)
      {
        if (off) off()

        delete entry.off

        this.index--

        if (first)
        {
          delete entry.first

          requery(query.endBefore(first))
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
