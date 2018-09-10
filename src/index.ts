
import { getInstance } from './instance'

export * from './constants'
export * from './types'
export { stats } from './stats'
export { callbacks } from './callbacks'
export { define, setGlobalOptions, mergeStrategy, mergeOptions, getOptions } from './options'
export { getCacheForData, destroyCache, destroyGlobalCache } from './cache'

export { getInstance }
export default getInstance
