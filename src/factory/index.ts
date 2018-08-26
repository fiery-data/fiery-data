

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
