

import { FieryInstance, FieryEntry, FieryTarget, FierySource, FieryOptions } from '../types'
import { getEntry } from '../entry'



import factoryDocument from './document'
import factoryMap from './map'
import factoryCollection from './collection'
import factoryStream from './stream'



export function factory (entry: FieryEntry): FieryTarget
{
  let chosenFactory = (<any>entry.source).where
    ? (entry.options.stream
        ? factoryStream
        : (entry.options.map
            ? factoryMap
            : factoryCollection
          )
      )
    : factoryDocument

  return chosenFactory(entry)
}

export default factory
