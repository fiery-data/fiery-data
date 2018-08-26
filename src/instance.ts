
import { FierySystem, FieryInstance, FieryOptionsInput, FieryTarget, FierySource, FieryEntry, FieryOptions } from './types'
import { forEach } from './util'
import { factory } from './factory'
import { getEntry, closeEntry } from './entry'
import { removeCacheFromInstance } from './cache'
import { globalOptions } from './options'
import * as operations from './operations'


export function getInstance (systemOverrides?: Partial<FierySystem>): FieryInstance
{
  const system = buildSystem(systemOverrides)

  const targetFactory = (source: FierySource, options?: FieryOptionsInput, name?: string): FieryTarget => {
    return factory(getEntry(instance, source, options, name))
  }

  const instance: FieryInstance = targetFactory as FieryInstance

  instance.system = system
  instance.entry = {}
  instance.entryList = []
  instance.options = {}
  instance.sources = {}
  instance.cache = {}
  instance.update = operations.update
  instance.sync = operations.sync
  instance.remove = operations.remove
  instance.clear = operations.clear
  instance.getChanges = operations.getChanges
  instance.ref = operations.ref
  instance.create = operations.create
  instance.createSub = operations.createSub
  instance.build = operations.build
  instance.buildSub = operations.buildSub
  instance.entryFor = entryFor
  instance.destroy = destroy
  instance.free = free
  instance.linkSources = linkSources

  return instance as FieryInstance
}

function destroy(this: FieryInstance)
{
  forEach(this.options, opt => delete globalOptions.map[opt.id])
  forEach(this.cache, cached => removeCacheFromInstance(cached, this))
  forEach(this.entryList, entry => closeEntry(entry, true))

  this.entry = {}
  this.entryList = []
  this.options = {}
  this.sources = {}
  this.cache = {}
}

function free (this: FieryInstance, target: FieryTarget)
{
  const entry = this.entryFor(target)

  if (entry !== null)
  {
    closeEntry(entry, true)
  }
}

function entryFor (this: FieryInstance, target: FieryTarget): FieryEntry | null
{
  const entries = this.entryList

  for (let i = 0; i < entries.length; i++)
  {
    const entry = entries[i]

    if (entry && entry.target === target)
    {
      return entry
    }
  }

  return null
}

function linkSources (this: FieryInstance, container: any): void
{
  const entryList: (FieryEntry | null)[] = this.entryList

  for (let i = 0; i < entryList.length; i++)
  {
    const entry: FieryEntry | null = entryList[i]

    if (entry === null)
    {
      continue
    }

    const options: FieryOptions = entry.options

    if (!options.parent && !entry.name)
    {
      for (let prop in container)
      {
        if (container[prop] === entry.target)
        {
          entry.name = prop

          this.entry[ prop ] = entry
          this.sources[ prop ] = entry.source

          break
        }
      }
    }
  }
}

function buildSystem(systemOverrides?: Partial<FierySystem>): FierySystem
{
  const system = systemOverrides || {}

  for (let prop in defaultSystem)
  {
    const systemProp = prop as keyof FierySystem

    if (!(systemProp in system))
    {
      system[systemProp] = defaultSystem[systemProp]
    }
  }

  return system as FierySystem
}

const defaultSystem: FierySystem = {
  removeNamed: (name: string) => {

  },
  setProperty: (target: any, property: string, value: any) => {
    target[property] = value
  },
  removeProperty: (target: any, property: string) => {
    delete target[property]
  },
  arraySet: (target: any[], index: number, value: any) => {
    target[index] = value
  },
  arrayAdd: (target: any[], value: any) => {
    target.push(value)
  },
  arrayResize: (target: any[], size: number) => {
    target.length = size
  }
}
