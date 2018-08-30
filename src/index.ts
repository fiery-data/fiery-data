
import { define, setGlobalOptions, mergeStrategy, mergeOptions } from './options'
import { getCacheForData, destroyCache } from './cache'
import { getInstance } from './instance'
import { stats } from './stats'

export * from './constants'
export * from './types'
export { stats }
export { define, setGlobalOptions, mergeStrategy, mergeOptions }
export { getCacheForData, destroyCache }
export default getInstance
