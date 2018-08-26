
import * as firebase from 'firebase'



type Query = firebase.firestore.Query
type QuerySnapshot = firebase.firestore.QuerySnapshot
type GetOptions = firebase.firestore.GetOptions
type Firestore = firebase.firestore.Firestore
type QueryListenOptions = firebase.firestore.QueryListenOptions
type DocumentListenOptions = firebase.firestore.DocumentListenOptions
type DocumentReference = firebase.firestore.DocumentReference
type CollectionReference = firebase.firestore.CollectionReference
type DocumentSnapshot = firebase.firestore.DocumentSnapshot



export type FieryData = { [prop: string]: any }

export type FieryMap = { [key: string]: FieryData }

export type FieryTarget = FieryData[] | FieryData | FieryMap

export type FieryExclusions = { [field: string]: boolean }

export type FierySource = Query | DocumentReference | CollectionReference

export type FierySources = { [name: string]: FierySource }

export type FieryEntryMap = { [key: string]: FieryEntry }

export type FieryChanges = { changed: boolean, remote: FieryData, local: FieryData }

export type FieryEquality = (a: any, b: any) => boolean

export type FieryMergeStrategy = (a: any, b: any) => any

export type FieryMergeStrategies = { [option: string]: FieryMergeStrategy }

export type FieryOptionsMap = { [name: string]: Partial<FieryOptions> }

export type FieryOptionsInput = string | Partial<FieryOptions>

export type FieryFields = string | string[]

export type FieryCache = { [uid: string]: FieryCacheEntry }


export interface FierySystem
{
  removeNamed: (name: string) => any

  setProperty: (target: any, property: string, value: any) => any

  removeProperty: (target: any, property: string) => any

  arraySet: (target: any[], index: number, value: any) => any

  arrayAdd: (target: any[], value: any) => any

  arrayResize: (target: any[], size: number) => any
}

export interface FieryOptions
{

  extends?: FieryOptionsInput

  id: number

  shared: boolean

  instance?: FieryInstance

  key?: string

  query?: (source: CollectionReference) => Query

  map?: boolean

  doc?: boolean

  ref?: boolean

  once?: boolean

  type?: { new (): FieryData }

  newDocument: (encoded?: FieryData) => FieryData

  newCollection: () => FieryMap | FieryData[]

  decode?: (encoded: FieryData) => FieryData

  decoders?:
  {
    [prop: string]: (a: any, encoded: FieryData) => any
  }

  encoders?:
  {
    [prop: string]: (a: any, data: FieryData) => any
  }

  defaults:
  {
    [prop: string]: any | (() => any)
  }

  record?: boolean

  recordOptions:
  {
    sync?: string
    update?: string
    remove?: string
    ref?: string
    clear?: string
    build?: string
    create?: string
    getChanges?: string
    [unspecified: string]: any
  }

  exclude: FieryExclusions | string[]

  include: string[]

  parent?: FieryOptions

  sub?:
  {
    [subProp: string]: FieryOptionsInput
  }

  propValue: string

  onceOptions?: GetOptions

  liveOptions: QueryListenOptions | DocumentListenOptions

  onError: (error: any) => any

  onSuccess: (target: FieryTarget) => any

  onMissing: () => any

  onRemove: () => any

}

export interface FieryInstance
{

  <T extends FieryTarget>(source: FierySource, options?: FieryOptionsInput, name?: string): T

  system: FierySystem

  options:
  {
    [optionKey: number]: FieryOptions
  }

  sources:
  {
    [name: string]: FierySource
  }

  entry: FieryEntryMap

  entryList: (FieryEntry | null)[]

  entryFor: (target: FieryTarget) => FieryEntry | null

  cache: FieryCache

  destroy: () => void

  free: (target: FieryTarget) => void

  linkSources: (container: any) => void

  update: (data: FieryData, fields?: FieryFields) => Promise<void>

  sync: (data: FieryData, fields?: FieryFields) => Promise<void>

  remove: (data: FieryData) => Promise<void>

  clear: (data: FieryData, props: FieryFields) => Promise<void[]>

  getChanges: (data: FieryData,
    fieldsOrEquality: FieryFields | FieryEquality,
    equalityOrNothing?: FieryEquality) => Promise<FieryChanges>

  ref: (data: FieryData) => FierySource

  create: <T extends FieryData>(target: string | FieryTarget, initial?: FieryData) => T

  createSub: <T extends FieryData>(data: FieryData, sub: string, initial?: FieryData) => T

  build: <T extends FieryData>(target: string | FieryTarget, initial?: FieryData) => T

  buildSub: <T extends FieryData>(data: FieryData, sub: string, initial?: FieryData) => T
}

export interface FieryMetadata
{

  uid: string

  path: string

  storeKey: number

  store: Firestore

  optionKey: string

  options: FieryOptions

}

export type FieryRecordSync = (fields?: FieryFields) => Promise<void>

export type FieryRecordUpdate = (fields?: FieryFields) => Promise<void>

export type FieryRecordRemove = (excludeSubs: boolean) => Promise<void>

export type FieryRecordRef = (sub?: string) => FierySource

export type FieryRecordClear = (props: FieryFields) => Promise<void[]>

export type FieryRecordCreate = <T extends FieryData>(sub: string, initial?: FieryData) => T

export type FieryRecordBuild = <T extends FieryData>(sub: string, initial?: FieryData) => T

export type FieryRecordChanges = (fieldsOrEquality: FieryFields | FieryEquality, equalityOrNothing?: FieryEquality) => Promise<FieryChanges>

export interface FieryEntry
{

  name?: string

  options: FieryOptions

  source: FierySource

  instance: FieryInstance

  storeKey: number

  target?: FieryTarget

  children: FieryCache

  recordFunctions:
  {
    sync: FieryRecordSync

    update: FieryRecordUpdate

    remove: FieryRecordRemove

    ref: FieryRecordRef

    clear: FieryRecordClear

    create: FieryRecordCreate

    build: FieryRecordBuild

    getChanges: FieryRecordChanges
  }

  promise?: Promise<QuerySnapshot>

  off?: () => any

  id?: number

  index?: number,

  live: boolean

}

export interface FieryCacheEntry
{

  uid: string

  data: FieryData

  ref: DocumentReference

  uses: number

  sub: FieryEntryMap

  firstEntry: FieryEntry

  entries: FieryEntry[]

  removed: boolean

}
