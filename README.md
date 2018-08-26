
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

### Related

- [fiery-vue](https://github.com/fiery-data/fiery-vue): fiery-data for VueJS

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
import $getFiery, { define, FieryRecordUpdate, FieryRecordRemove } from 'fiery-data'

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
  save: FieryRecordUpdate
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
      update: 'save',
      remove: 'remove'
    }
  }
})

// firebase
const app = firebase.initializeApp({ /* firebase options */ })
const fs = firebase.firestore(app)

const $fiery = $getFiery(/* options for binding to other frameworks */)

// a single document, kept up to date
const specificTask: Task = $fiery(ds.doc('tasks/1'), 'task')

// all documents in the collection, live (ordered by most recently edited)
const allTasks: Task[] = $fiery(ds.collection('tasks'), 'task')

// all done tasks, ordered by most recently done
const doneTasks: Task[] = $fiery(ds.collection('tasks'), {
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
  FieryRecordUpdate, FieryRecordRemove, FieryRecordCreate, FieryRecordBuild } from 'fiery-data'

// Classes
class ActiveRecord {
  save: FieryRecordUpdate
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
    update: 'save',
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
- `$fiery.ref ( data, sub? ): DocumentReference | CollectionReference`
  - **data**
    - the data to get the firebase reference of
  - **sub**
    - a sub collection of the given data to return
- `$fiery.create ( target, initial? )`
  - TODO
- `$fiery.createSub ( target, sub, initial? )`
  - TODO
- `$fiery.build ( target, initial? )`
  - TODO
- `$fiery.buildSub ( target, sub, initial? )`
  - TODO
- `$fiery.free ( target ): void`
  - stops live data on the target and removes cached values when possible
- `$fiery.destroy (): void`
  - calls free on all targets generated with `$fiery (...)`


## LICENSE
[MIT](https://opensource.org/licenses/MIT)
