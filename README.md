
<p align="center">
<img src="https://img.shields.io/npm/v/vue-fiery.svg">
<img src="https://img.shields.io/npm/l/vue-fiery.svg">
<img src="https://travis-ci.org/ClickerMonkey/vue-fiery.svg?branch=master">
</p>

## vue-fiery

Vue.js binding for Google Firebase Cloud Firestore.

#### Features
- Documents [example](#documents)
- Collections (stored as array or map) [example](#collections)
- Queries (stored as array or map) [example](#queries)
- Real-time or once [example](#real-time-or-once)
- Data or computed properties [example](#data-or-computed)
- Adding, updating, sync, removing, remove field [example](#adding-updating-overwriting-removing)
- Sub-collections (with cascading deletions!) [example](#sub-collections)
- Return instances of a class [example](#return-instances-of-a-class)
- Add active record methods (sync, update, remove, clear, getChanges) [example](#active-record)
- Control over what properties are sent on save [example](#save-fields)
- Encode & decode properties [example](#encode--decode-properties)
- Adding the key to the document [example](#adding-key-to-object)
- Sharing, extending, defining, and global options [example](#sharing-extending-defining-and-global-options)
- Callbacks (error, success, missing, remove) [example](#callbacks)
- Custom binding / unbinding

**Contents**
- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)

### Dependencies

- Firebase ^5.0.0
- Vue: ^1.0.28

### Installation

#### npm

Installation via npm : `npm install vue-fiery --save`

### Usage

```javascript
import Vue from 'vue'
import VueFiery from 'vue-fiery'
import firebase from 'firebase'

require('firebase/firestore')

Vue.use(VueFiery)

const firebaseApp = firebase.initializeApp({ ... })
const db = firebaseApp.firestore();

var vm = new Vue({
  el: '#app',
  data() {
    return {
      todos: this.$fiery(db.collection('todos')) // live collection,
      ford: this.$fiery(db.collection('cars').doc('ford')), // live document
      role: 'admin'
    }
  },
  computed: {
    // Updated when role changes
    personsWithRole() {
      return this.$fiery(db.collection('persons'), {
        query: (q) => q.where('role', '==', this.role),
        type: Person
      })
    }
  }
})
```

Each record of the array will contain a `.uid` property. This helps identify
what firestore database the document is stored, in what collection, and with which options

```json
[
    {
        ".uid": "1///1///todos/-Jtjl482BaXBCI7brMT8",
        "name": "Star vue-fiery",
        "done": true
    }
]
```

### Documents

```javascript
const db = firebaseApp.firestore();
new Vue({
  inject: ['currentUserId'],
  data() {
    const $fiery = this.$fiery
    return {
      settings: $fiery(db.collection('settings').doc('system')),
      currentUser: $fiery(db.collection('users').doc(this.currentUserId)) // not reactive, but is updated real-time
    }
  }
})
```

### Collections

```javascript
const db = firebaseApp.firestore();
new Vue({
  data() {
    const $fiery = this.$fiery
    return {
      cars: $fiery(db.collection('cars')) // real-time array
      carMap: $fiery(db.collection('cars'), {map: true}) // real-time map: carMap[id] = car
    }
  }
})
```

### Queries

```javascript
const db = firebaseApp.firestore();
new Vue({
  inject: ['currentUserId'],
  data() {
    const $fiery = this.$fiery
    return {
      currentCars: $fiery(db.collection('cars'), { // real-time array
        query: (cars) => cars.where('created_by', '==', this.currentUserId)
      })
      currentCarMap: $fiery(db.collection('cars'), { // real-time map: currentCarMap[id] = car
        query: (cars) => cars.where('created_by', '==', this.currentUserId),
        map: true
      })
    }
  }
})
```

### Real-time or once

```javascript
const db = firebaseApp.firestore();
new Vue({
  inject: ['currentUserId'],
  data() {
    const $fiery = this.$fiery
    return {
      // real-time is default, all you need to do is specify once: true to disable it
      cars: $fiery(db.collection('cars'), {once: true}), // array populated once
      currentUser: $fiery(db.collection('users').doc(this.currentUserId), {once: true}), // current user populated once
    }
  }
})
```

### Data or computed

```javascript
const db = firebaseApp.firestore();
new Vue({
  inject: ['currentUserId'],
  data() {
    // data examples above
    return {
      limit: 25,
      status: 'unfinished'
    }
  },
  computed: {
    currentUser() {
      return this.$fiery(db.collection('users').doc(this.currentUserId)) // reactive and real-time
    },
    todos() {
      return this.$fiery(db.collection('todos'), { // reactive and real-time
        query: (todos) => todos
          .where('created_by', '==', this.currentUserId)
          .where('status', '==', this.status)
          .limit(this.limit),

      })
    }
  }
})
```

### Adding, updating, overwriting, removing

```javascript
const db = firebaseApp.firestore();
new Vue({
  inject: ['currentUserId'],
  data() {
    return {
      todos: this.$fiery(db.collection('todos'))
    }
  },
  computed: {
    currentUser() {
      return this.$fiery(db.collection('users').doc(this.currentUserId))
    }
  },
  methods: {
    addTodo() { // COLLECTIONS STORED IN $fires
      // once successful, this.todos will be updated
      this.$fires.todos.add({
        name: 'Like vue-fiery',
        done: true
      })
    },
    updateUser() {
      this.$fiery.update(this.currentUser)
    },
    updateUserEmailOnly() {
      this.$fiery.update(this.currentUser, ['email'])
    },
    updateAny(data) { // any document can be passed, ex: this.todos[1], this.currentUser
      this.$fiery.update(data)
    },
    overwrite(data) { // only fields present on data will exist on sync
      this.$fiery.sync(data)
    },
    remove(data) {
      this.$fiery.remove(data) // removes sub collections as well
      this.$fiery.remove(data, true) // preserves sub collections
    },
    removeName(todo) {
      this.$fiery.clear(data, 'name') // can also specify an array of props or sub collections
    }
  }
})
```

### Sub-collections

You can pass the same options to sub, nesting as deep as you want!

```javascript
const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      // this.todos[todoIndex].children[childIndex]
      todos: this.$fiery(db.collection('todos'), {
        sub: {
          children: { // creates an array or map on each todo object: todo.children[]
            // once, map, etc
            query: (children) => children.orderBy('updated_at')
          }
        }
      })
    }
  },
  methods: {
    addChild(parent) {
      // or this.$fiery.ref(parent, 'children') for short
      this.$fiery.ref(parent).collection('children').add({
        name: 'Fork vue-fiery',
        done: false
      })
    },
    clearChildren(parent) {
      this.$fiery.clear(parent, 'children') // clear the sub collection
    }
  }
})
```

### Return instances of a class

```javascript
function Todo() {

}
Todo.prototype = {
  markDone (byUser) {
    this.done = true
    this.updated_at = Date.now()
    this.updated_by = byUser.id
  }
}

const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      // this.todos[todoIndex] instanceof Todo
      todos: this.$fiery(db.collection('todos'), {
        type: Todo,
        // OR you can specify newDocument and do custom loading (good for polymorphic data)
        newDocument: function(initialData) {
          var instance = new Todo()
          instance.callSomeMethod()
          return instance
        }
      })
    }
  }
})
```

### Active Record

```javascript
// can be used with type, doesn't have to be
function Todo() {

}
Todo.prototype = {
  markDone (byUser) {
    this.done = true
    this.updated_at = Date.now()
    this.updated_by = byUser.id
    this.$update()
  }
}

const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      todos: this.$fiery(db.collection('todos'), {
        type: Todo,
        record: true
        // $sync, $update, $remove, $ref, $clear, $getChanges are functions added to every Todo instance
      }),
      todosCustom: this.$fiery(db.collection('todos'), {
        record: true,
        recordOptions: { // which methods do you want added to every object, and with what method names?
          sync: 'sync',
          update: 'save',
          remove: 'destroy'
          // we don't want $ref, $clear, or $getChanges
        }
      })
    }
  },
  methods: {
    updateTodoAt(index) {
      // instead of this.$fiery.update(this.todos[index])
      this.todos[index].$update()
    },
    saveTodoCustomAt(index) {
      // instead of this.$fiery.update(this.todosCustom[index])
      this.todosCustom[index].save()
    },
    done(todo) {
      todo.markDone(this.currentUser) // assuming currentUser exists
    },
    getChanges(todo) {
      todo.$getChanges(['name', 'done'], function(changes, saved, current) {
        // are there unsaved changes in name or done? (exclude array to check entire document)
      })
    }
  }
})
```

### Save fields

```javascript
const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      todos: this.$fiery(db.collection('todos'), {
        include: ['name', 'done'], // if specified, we ONLY send these fields on sync/update
        exclude: ['hidden'] // if specified here, will not be sent on sync/update
      }),
    }
  },
  methods: {
    save(todo) {
      this.$fiery.update(todo)
    },
    saveDone(todo) {
      this.$fiery.update(todo, ['done']) // only send this value if it exists
    },
    saveOverride(todo) {
      this.$fiery.update(todo, ['hidden']) // ignores exclude and include when specified
    }
  }
})
```

### Encode & decode properties

```javascript
const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      todos: this.$fiery(db.collection('todos'), {
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
    }
  }
})
```

### Adding key to object

```javascript
const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      todos: this.$fiery(db.collection('todos'), {key: 'id', exclude: ['id']}) // must be excluded manually
    }
  },
  methods: {
    log(todo) {
      // todo.id exists now
      console.log(todo)
    }
  }
})
```

### Sharing, extending, defining, and global options

```javascript
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
VueFiery.define('post', {
  // shared is not necessary here
  include: ['title', 'content', 'tags']
})

// or multiple
VueFiery.define({
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
VueFiery.setGlobalOptions({
  // lets make everything active record
  record: true,
  recordOptions: {
    update: 'save',         // object.save(fields?)
    sync: 'sync',           // object.sync(fields?)
    remove: 'remove',       // object.remove()
    clear: 'clear',         // object.clear(fields)
    ref: 'doc',             // object.doc().collection('subcollection')
    getChanges: 'changes'   // object.changes((changes, remote, local) => {})
  }
})

const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      comments: this.$fiery(db.collection('comment'), 'comment') // you can pass a named or Shared
    }
  }
})
```

### Callbacks

```javascript
const db = firebaseApp.firestore();
new Vue({
  data() {
    return {
      todos: this.$fiery(db.collection('todos'), {
        onSuccess: (todos) => {},
        onError: (message) => {},
        onRemove: () => {},
        onMissing: () => {} // occurs for documents
      })
    }
  }
})
```

## LICENSE
[MIT](https://opensource.org/licenses/MIT)
