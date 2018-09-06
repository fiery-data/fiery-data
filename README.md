
<p align="center">
  <img src="https://avatars1.githubusercontent.com/u/42543587?s=200&v=4" alt="Fiery Data">  
</p>

<p align="center">
<img src="https://img.shields.io/npm/v/fiery-data.svg">
<img src="https://img.shields.io/npm/l/fiery-data.svg">
<img src="https://travis-ci.org/fiery-data/fiery-data.svg?branch=master">
</p>

## fiery-data

A library which binds Firestore data to plain arrays and objects and keeps them in sync.

### Features

- Documents [example](#documents)
- Collections (stored as array or map) [example](#collections)
- Queries (stored as array or map) [example](#queries)
- Real-time or once [example](#real-time-or-once)
- Adding, updating, sync, removing, remove field [example](#adding-updating-overwriting-removing)
- Sub-collections (with cascading deletions!) [example](#sub-collections)
- Return instances of a class [example](#return-instances-of-a-class)
- Add active record methods (sync, update, remove, clear, getChanges) [example](#active-record)
- Control over what properties are sent on save [example](#save-fields)
- Encode & decode properties [example](#encode--decode-properties)
- Adding the key to the document [example](#adding-key-to-object)
- Sharing, extending, defining, and global options [example](#sharing-extending-defining-and-global-options)
- Callbacks (error, success, missing, remove) [example](#callbacks)
- Custom binding / unbinding [example](#binding-and-unbinding)

### Related

- [fiery-vue](https://github.com/fiery-data/fiery-vue): fiery-data for VueJS
- [fiery-vuex](https://github.com/fiery-data/fiery-vuex): fiery-data for Vuex

**Contents**
- [Dependencies](#dependencies)
- [Installation](#installation)
- [Examples](#examples)
- [API](#api)
- [License](#license)

### Dependencies

- Firebase ^5.0.0

### Installation

#### npm

Installation via npm : `npm install fiery-data --save`

### Examples

##### JS

```javascript
// Firebase
var app = firebase.initializeApp({ /* firebase options */ })
var fs = firebase.firestore(app)

// VueFiery is available through UMD
// factory for creating and destroying live data
var $fiery = VueFiery()

// get a single document
var specificTask = $fiery(fs.doc('tasks/1'))

// get a live array of documents
var tasks = $fiery(fs.collection('tasks'))

// get a live map of documents
var taskMap = $fiery(fs.collection('tasks'), {map: true})

// get the current array of documents, don't update anything
var tasksOnce = $fiery(fs.collection('tasks'), {once: true})

// update
specificTask.name = 'New name'
$fiery.update(specificTask)

// get new (is not saved)
var taskUnsaved = $fiery.build(tasks, { // option initial
  name: 'New task'
})

// get new (saved - updates tasks once "saved")
var taskSaved = $fiery.create(tasks, {
  name: 'New saved task'
})

// remove
$fiery.remove(specificTask)

// manually stop live data
$fiery.free(tasks)

// no more live data, saving, or deleting. release cached values
$fiery.destroy()
```

Each object will contain a `.uid` property. This helps identify what firestore
database the document is stored in, the collection, and with which options.

```json
{
  ".uid": "1///tasks/1",
  "name": "Star fiery-date",
  "done": true
}
```

##### TypeScript

A more advanced example with classes, active record, querying, and definitions

```typescript
import $getFiery, { define, FieryRecordSave, FieryRecordRemove } from 'fiery-data'

// classes are not required, but supported
class Task {
  name: string = ''
  done: boolean = false
  done_at: number | null = null
  done_by: string | null = null
  edited_at: number = 0

  finish (): void {
    this.done = true
    this.done_at = Date.now()
    this.done_by = 'Me'
    this.edited_at = Date.now()
    this.save()
  }

  // these are injected by recordOptions
  save: FieryRecordSave
  remove: FieryRecordRemove
}

// you can optional define options globally
define({
  task: {
    type: Task,
    include: ['name', 'done', 'done_at', 'done_by', 'edited_at'],
    query: q => q.orderBy('edited_at', 'desc'),
    record: true,
    recordOptions: {
      save: 'save',
      remove: 'remove'
    }
  }
})

// firebase
const app = firebase.initializeApp({ /* firebase options */ })
const fs = firebase.firestore(app)

const $fiery = $getFiery(/* options for binding to other frameworks */)

// a single document, kept up to date
const specificTask: Task = $fiery(fs.doc('tasks/1'), 'task')

// all documents in the collection, live (ordered by most recently edited)
const allTasks: Task[] = $fiery(fs.collection('tasks'), 'task')

// all done tasks, ordered by most recently done
const doneTasks: Task[] = $fiery(fs.collection('tasks'), {
  extends: 'task',
  query: q => q.where('done', '==', true).orderBy('done_at', 'desc')
})

// finish this task - which updates all the references
specificTask.finish()

// no more live data, saving, or deleting. release cached values
$fiery.destroy()
```

Another advanced example with sub collections (blog with live comments)

```typescript
import $getFiery, { define, setGlobalOptions,
  FieryRecordSave, FieryRecordRemove, FieryRecordCreate, FieryRecordBuild } from 'fiery-data'

// Classes
class ActiveRecord {
  save: FieryRecordSave
  remove: FieryRecordRemove
  create: FieryRecordCreate
  build: FieryRecordBuild
}

class BlogPost extends ActiveRecord {
  title: string = ''
  content: string = ''
  author: string = ''
  url: string = ''
  tags: string[] = []
  created_at: Date
  comments: BlogPostComment[] = []
}

class BlogPostComment extends ActiveRecord {
  title: string = ''
  author: string = ''
  created_at: Date
  comments: BlogPostComment[] = []
}

// Options
setGlobalOptions({
  record: true,
  recordOptions: {
    save: 'save',
    remove: 'remove',
    create: 'create',
    build: 'build'
  }
})

define({
  postListing: {
    type: BlogPost,
    once: true, // we don't need to have live post data
    include: ['title', 'content', 'author', 'tags', 'url', 'created_at']
  },
  postView: {
    extends: 'postListing'
    sub: {
      comments: 'comment'
    }
  },
  comment: {
    type: BlogPostComment,
    include: ['title', 'author', 'created_at'],
    sub: {
      comments: 'comment'
    }
  }
})

// Firestore & Fiery
const app = firebase.initializeApp({ /* firebase options */ })
const fs = firebase.firestore(app)
const $fiery = $getFiery()

// Functions
function getFrontPage (limit: number = 10): BlogPost[]
{
  const options = {
    extends: 'postListing',
    query: q => q.orderBy('created_at', 'desc').limit(limit)
  }

  return $fiery(fs.collection('posts'), options)
}

function getPost (id: string): BlogPost
{
  return $fiery(fs.collection('posts').doc(id), 'postView')
}

function getPostsByTag (tag: string, limit: number = 10): BlogPost
{
  const options = {
    extends: 'postListing',
    query: q => q
      .where('tags', 'array_contains', tag)
      .orderBy('created_at', 'desc')
      .limit(limit)
  }

  return $fiery(fs.collection('posts'), options, 'byTag')
}

function addComment (addTo: BlogPost | BlogPostComment, comment: string): BlogPostComment
{
  return addTo.create('comments', {
    title: comment,
    created_at: new Date(),
    author_id: 'CURRENT_USER'
  })
}

$fiery.destroy()
```

## API

- `$fiery ( source, options?, name? )`
  - **source**
    - `fs.doc ('path/to/doc')`
    - `fs.collection ('items')`
  - **options**
    - name of options passed to `define`
    - [checkout this file to see the available values](src/types.ts#L64)
  - **name**
    - necessary when you call `$fiery` multiple times (like as a result of a function with parameters) or if you want to call `create` or `build` passing a `string`
- `$fiery.update ( data, fields? ): Promise<void>`
  - **data**
    - the data of a document to update
  - **fields**
    - optionally you can pass a field name or array of fields to update (as opposed to all)
- `$fiery.save ( data, fields? ): Promise<void>`
  - **data**
    - the data of a document to save (update if it exists, set if it does not)
  - **fields**
    - optionally you can pass a field name or array of fields to update (as opposed to all)
- `$fiery.sync ( data, fields? ): Promise<void>`
  - **data**
    - the data of a document to update. any fields not on the document or specified in fields will be removed
  - **fields**
    - optionally you can pass a field name or array of fields to sync. any other fields in the document not specified here are removed
- `$fiery.remove ( data, excludeSubs? ): Promise<void>`
  - **data**
    - the data of the document to remove. by default the sub collections specified in the options are removed as well
  - **excludeSubs**
    - if you wish, you could only remove the document data and not the sub collections
- `$fiery.clear ( data, fields ): Promise<void>`
  - **data**
    - the data of the document to clear values of
  - **fields**
    - the fields to remove from the document - or sub collections to remove (if specified in the options)
- `$fiery.getChanges ( fields?, isEqual? ): Promise<{changed, remote, local}>`
  - **fields**
    - optionally you can check specific fields for changes, otherwise all are checked
  - **isEqual**
    - you can pass your own function which checks two values for equality
  - **returns**
    - the promise resolves with an object with `changed`, `remote`, and `local`
      - `changed` is either true or false
      - `remote` are the changed saved values
      - `local` are the changed unsaved values
- `$fiery.pager ( target ): FieryPager`
  - **target**
    - the collection to paginate
- `$fiery.ref ( data, sub? ): DocumentReference | CollectionReference`
  - **data**
    - the data to get the firebase reference of
  - **sub**
    - a sub collection of the given data to return
- `$fiery.create ( target, initial? )`
  - **target**
    - the collection to add a value to and save
  - **initial**
    - the initial values of the data being created
- `$fiery.createSub ( target, sub, initial? )`
  - **target**
    - the target which has the sub collection
  - **sub**
    - the sub collection to add a value to and save
  - **initial**
    - the initial values of the data being created
- `$fiery.build ( target, initial? )`
  - **target**
    - the collection to add a value (unsaved)
  - **initial**
    - the initial values of the data being built
- `$fiery.buildSub ( target, sub, initial? )`
  - **target**
    - the target which has the sub collection
  - **sub**
    - the sub collection to add a value (unsaved)
  - **initial**
    - the initial values of the data being created
- `$fiery.free ( target ): void`
  - stops live data on the target and removes cached values when possible
- `$fiery.destroy (): void`
  - calls free on all targets generated with `$fiery (...)`

## Examples

### Documents

```javascript
// real-time documents
var settings = $fiery(fs.collection('settings').doc('system'))

var currentUser = $fiery(fs.collection('users').doc(USER_ID)) 
```

### Collections

```javascript
// real-time array
var cars = $fiery(fs.collection('cars')) 

// real-time map: carMap[id] = car
var carMap = $fiery(fs.collection('cars'), {map: true}) 
```

### Queries

```javascript
// real-time array
var currentCars = $fiery(fs.collection('cars'), { 
  query: cars => cars.where('make', '==', 'Honda')
})

// a parameterized query that can be invoked any number of times
function searchCars(make)
{
   var options = {
      query: cars => cars.where(make, '==', make)
   }
   return $fiery(fs.collection('cars'), options, 'searchCars') // name (searchCars) is required when parameterized
}

var cars1 = searchCars('Honda')
var cars2 = searchCars('Ford')

// cars1 === cars2, same array. Using the name ensures one query is no longer listened to - and only the most recent one
```

### Real-time or once

```javascript
// real-time is default, all you need to do is specify once: true to disable it

// array populated once
var cars = $fiery(fs.collection('cars'), {once: true})

// current user populated once
var currentUser = $fiery(fs.collection('users').doc(USER_ID), {once: true}), 
```

### Adding, updating, overwriting, removing

```javascript
var currentUser = $fiery(fs.collection('users').doc(USER_ID), {}, 'currentUser')
var todos = $fiery(fs.collection('todos'), {}, 'todos') // name required to get access to sources

function addTodo() // COLLECTIONS STORED IN stores
{ 
  $fiery.sources.todos.add({
    name: 'Like fiery-data',
    done: true
  })
  // OR
  var savedTodo = $fiery.create(todos, { // you can pass this.todos or 'todos'
    name: 'Love fiery-data',
    done: false
  })
}

function updateUser() 
{
  $fiery.update(currentUser)
}
function updateUserEmailOnly() 
{
 $fiery.update(currentUser, ['email'])
}
function updateAny(data) // any document can be passed, ex: this.todos[1], this.currentUser
{ 
  $fiery.update(data)
}
function overwrite(data) // only fields present on data will exist on sync
{ 
  $fiery.sync(data)
}
function remove(data) 
{
  $fiery.remove(data) // removes sub collections as well
  $fiery.remove(data, true) // preserves sub collections
}
function removeName(todo) 
{
  $fiery.clear(todo, 'name') // can also specify an array of props/sub collections
}
```

### Sub-collections

You can pass the same options to sub, nesting as deep as you want!

```javascript
var todos = $fiery(fs.collection('todos'), {
  sub: {
    children: { // creates an array or map on each todo object: todo.children[]
      // once, map, etc
      query: children => children.orderBy('updated_at')
    }
  }
})

// todos[todoIndex].children[childIndex]

function addChild(parent) 
{
  $fiery.ref(parent).collection('children').add( { /* values */ } )
  // OR
  $fiery.ref(parent, 'children').add( { /* values */ } )
  // OR
  var savedChild = $fiery.createSub(parent, 'children', { /* values */ } )
  // OR
  var unsavedChild = $fiery.buildSub(parent, 'children', { /* values */ } )
}

function clearChildren(parent)
{
  $fiery.clear(parent, 'children') // clear the sub collection of all children currently in parent.children
}
```

### Return instances of a class

```javascript
function Todo() {}
Todo.prototype = {
  markDone (byUser) {
    this.done = true
    this.updated_at = Date.now()
    this.updated_by = byUser.id
  }
}

var todos $fiery(fs.collection('todos'), {
  type: Todo,
  // OR you can specify newDocument and do custom loading (useful for polymorphic data)
  newDocument: function(initialData) {
    var instance = new Todo()
    instance.callSomeMethod()
    return instance
  }
})
```

### Active Record

```javascript
// can be used with type, doesn't have to be
function Todo() {}
Todo.prototype = {
  markDone (byUser) {
    this.done = true
    this.updated_at = Date.now()
    this.updated_by = byUser.id
    this.$save() // injected
  }
}

var todos = $fiery(fs.collection('todos'), {
  type: Todo,
  record: true
  // $sync, $update, $remove, $ref, $clear, $getChanges, $build, $create, $save, $refresh are functions added to every Todo instance
})

todos[i].$update()
todos[i].markDone(currentUser)
todos[i].$getChanges(['name', 'done']).then((changes) => {
  // changes.changed, changes.remote, changes.local
})

var todosCustom = $fiery(fs.collection('todos'), {
  record: true,
  recordOptions: { // which methods do you want added to every object, and with what method names?
    save: 'save',
    remove: 'destroy'
    // we don't want $ref, $clear, $getChanges, etc
  }
})

todosCustom[i].save()
todosCustom[i].destroy()
```

### Save fields

```javascript
var todos = $fiery(fs.collection('todos'), {
  include: ['name', 'done'], // if specified, we ONLY send these fields on sync/update
  exclude: ['hidden'] // if specified here, will not be sent on sync/update
})

var todo = todos[i]

$fiery.update(todo) // sends name and done as configured above
$fiery.update(todo, ['done']) // only send this value if it exists
$fiery.update(todo, ['hidden']) // ignores exclude and include when specified

// $fiery.save also takes fields, when you're not sure if your document exists.
```

### Encode & decode properties

```javascript
var todos = $fiery(fs.collection('todos'), {
  // convert server values to local values
  decoders: {
    status(remoteValue, remoteData) {
      return remoteValue === 1 ? 'done' : (remoteValue === 2 ? 'started' : 'not started')
    }
  },
  // convert local values to server values
  encoders: {
    status(localValue, localData) {
      return localValue === 'done' ? 1 : (localeValue === 'started' ? 2 : 0)
    }
  },
  // optionally instead of individual decoders you can specify a function
  decode(remoteData) {
    // do some decoding, maybe do something special
    return remoteData
  }
})
```

### Adding key to object

```javascript
var todos = $fiery(fs.collection('todos'), {key: 'id', exclude: ['id']})

// todos[i].id exists now
```

### Sharing, extending, defining, and global options

```javascript
import { define, setGlobalOptions } from 'fiery-data'

// ==== Sharing ====
let Todo = {
  shared: true, // necessary for non-global or defined options that are used multiple times
  include: ['name', 'done', 'done_at']
}

// ==== Extending ====
let TodoWithChildren = {
  shared: true
  extends: Todo,
  sub: {
    children: Todo
  }
}

// ==== Defining ====
define('post', {
  // shared is not necessary here
  include: ['title', 'content', 'tags']
})

// or multiple
define({
  comment: {
    include: ['author', 'content', 'posted_at', 'status'],
    sub: {
      replies: 'comment' // we can reference options by name now, even circularly
    }
  },
  images: {
    include: ['url', 'tags', 'updated_at', 'title']
  }
})

// ==== Global ====
setGlobalOptions({
  // lets make everything active record
  record: true,
  recordOptions: {
    update: 'save',         // object.save(fields?)
    sync: 'sync',           // object.sync(fields?)
    remove: 'remove',       // object.remove()
    clear: 'clear',         // object.clear(fields)
    create: 'create',       // object.create(sub, initial?)
    build: 'build',         // object.build(sub, initial?)
    ref: 'doc',             // object.doc().collection('subcollection')
    getChanges: 'changes'   // object.changes((changes, remote, local) => {})
  }
})

var comments = $fiery(fs.collection('comment'), 'comment') // you can pass a named or Shared
```

### Callbacks

```javascript
var todos = $fiery(fs.collection('todos'), {
  onSuccess: (todos) => {}, // everytime todos updates this is called
  onError: (reason) => {}, // there was an error getting collection or document
  onRemove: () => {}, // document was removed
  onMissing: () => {} // document does not exist yet
})
```

### Binding and Unbinding

```javascript
var todos = $fiery(fs.collection('todos')) // will be live updated

$fiery.free(todos) // live updates stop
```

## LICENSE
[MIT](https://opensource.org/licenses/MIT)
