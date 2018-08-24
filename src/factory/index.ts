

import { FieryInstance, FieryEntry, FieryTarget, FierySource, FieryOptions } from '../types'
import { getEntry } from '../entry'



import factoryDocument from './document'
import factoryMap from './map'
import factoryCollection from './collection'



export function factory (entry: FieryEntry): FieryTarget
{
  let chosenFactory = (<any>entry.source).where
    ? (entry.options.map ? factoryMap : factoryCollection)
    : factoryDocument

  return chosenFactory(entry)
}

export default factory


// TODO when a factory is called again - take the existing target and compare it
// to the first set of values to determine what needs to be cleared from the
// entry cache. when the entry cache doesn't have an

// if !doc.exists in colllection, clearcache
