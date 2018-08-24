
<p align="center">
  <img src="https://avatars1.githubusercontent.com/u/42543587?s=200&v=4" alt="Fiery Data">  
</p>

## fiery-data

A library which binds Firestore data to plain arrays and objects and keeps them in sync.

**Contents**
- [Dependencies](#dependencies)
- [Installation](#installation)
- [Example](#example)

### Dependencies

- Firebase ^5.0.0

### Installation

#### npm

Installation via npm : `npm install fiery-data --save`

### Example

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
specificTask.name = 'Bare bones options!'
$fiery.update(specificTask)

// get a live array of documents
var tasks = $fiery(fs.collection('tasks'))

// get a live map of documents
var taskMap = $fiery(fs.collection('tasks'), {map: true})

// get the current array of documents, don't update anything
var tasksOnce = $fiery(fs.collection('tasks'), {once: true})

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

  public finish (): void {
    this.done = true
    this.done_at = Date.now()
    this.done_by = 'Me'
    this.edited_at = Date.now()
    this.save()
  }

  // these are injected by recordOptions
  public save: FieryRecordUpdate
  public remove: FieryRecordRemove
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

## LICENSE
[MIT](https://opensource.org/licenses/MIT)
