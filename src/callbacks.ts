
import { FieryData, FieryCacheEntry, FieryTarget, FieryEntry, FieryInstance } from './types'

export const callbacks =
{
  onInvalidOperation (_data: FieryData, _operation: string) {},

  onUpdate (_data: FieryData, _values: FieryData, _cache: FieryCacheEntry) {},

  onSet (_data: FieryData, _values: FieryData, _cache: FieryCacheEntry) {},

  onDelete (_data: FieryData, _cache: FieryCacheEntry) {},

  onClear (_data: FieryData, _props: string[]) {},

  onGetChanges (_data: FieryData, _cache: FieryCacheEntry, _fields?: string[]) {},

  onRefresh (_data: FieryData, _cachedOnly?: boolean) {},

  onBuild (_data: FieryData, _cache: FieryCacheEntry) {},

  onCacheCreate (_cache: FieryCacheEntry) {},

  onCacheDestroy (_cache: FieryCacheEntry) {},

  onSubCreate (_data: FieryData, _sub: string, _cache: FieryCacheEntry) {},

  onSubDestroy (_data: FieryData, _sub: string, _cache: FieryCacheEntry) {},

  onCollectionAdd (_data: FieryData, _target: FieryTarget, _entry: FieryEntry) {},

  onCollectionRemove (_data: FieryData, _target: FieryTarget, _entry: FieryEntry) {},

  onCollectionModify (_data: FieryData, _target: FieryTarget, _entry: FieryEntry) {},

  onCollectionChanged (_target: FieryTarget, _entry: FieryEntry) {},

  onDocumentUpdate (_data: FieryData, _entry: FieryEntry) {},

  onDocumentMissing (_data: FieryData, _entry: FieryEntry) {},

  onInstanceCreate (_instance: FieryInstance) {},

  onInstanceDestroy (_instance: FieryInstance) {},
}
