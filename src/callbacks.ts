
import { FieryData, FieryCacheEntry, FieryTarget, FieryEntry, FieryInstance } from './types'

export const callbacks =
{
  onInvalidOperation (data: FieryData, operation: string) {},

  onUpdate (data: FieryData, values: FieryData, cache: FieryCacheEntry) {},

  onSet (data: FieryData, values: FieryData, cache: FieryCacheEntry) {},

  onDelete (data: FieryData, cache: FieryCacheEntry) {},

  onClear (data: FieryData, props: string[]) {},

  onGetChanges (data: FieryData, cache: FieryCacheEntry, fields?: string[]) {},

  onRefresh (data: FieryData, cachedOnly?: boolean) {},

  onBuild (data: FieryData, cache: FieryCacheEntry) {},

  onCacheCreate (cache: FieryCacheEntry) {},

  onCacheDestroy (cache: FieryCacheEntry) {},

  onSubCreate (data: FieryData, sub: string, cache: FieryCacheEntry) {},

  onSubDestroy (data: FieryData, sub: string, cache: FieryCacheEntry) {},

  onCollectionAdd (data: FieryData, target: FieryTarget, entry: FieryEntry) {},

  onCollectionRemove (data: FieryData, target: FieryTarget, entry: FieryEntry) {},

  onCollectionModify (data: FieryData, target: FieryTarget, entry: FieryEntry) {},

  onCollectionChanged (target: FieryTarget, entry: FieryEntry) {},

  onDocumentUpdate (data: FieryData, entry: FieryEntry) {},

  onDocumentMissing (data: FieryData, entry: FieryEntry) {},

  onInstanceCreate (instance: FieryInstance) {},

  onInstanceDestroy (instance: FieryInstance) {},
}
