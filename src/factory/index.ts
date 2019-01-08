

import { FieryEntry, FieryTarget } from '../types'



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
