
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/chai/index.d.ts" />

import $getFiery, { define, setGlobalOptions, getCacheForData } from '../src'
import { FierySource, FieryChanges } from '../src/types'
import { globalOptions } from '../src/options'
import { getStore, getStored } from './util'
import { expect, assert } from 'chai'

describe('operations', function()
{

  before(function() {
    globalOptions.user = undefined
    globalOptions.defined = {}

    setGlobalOptions({
      record: true
    })

    define({
      todo: {
        include: ['name', 'done', 'due', 'assigned_to'],
        defaults: {
          name: '',
          done: false,
          due: null,
          assigned_to: null
        },
        sub: {
          children: 'todo'
        }
      }
    })
  })

  it ('updates', function()
  {
    const fs = getStore('operations updates', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()
    const todos: any = $fiery(fs.collection('todos'), 'todo')

    const todo1 = todos[0]

    expect(todo1).to.be.ok
    expect(todo1.name).to.equal('T1')

    todo1.name = 'T1a'
    todo1.$update()

    expect(getStored(fs, todo1).name).to.equal('T1a')

    $fiery.destroy()
  })

  it ('syncs', function()
  {
    const fs = getStore('operations syncs', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()
    const todo1: any = $fiery(fs.doc('todos/1'), 'todo')

    expect(todo1).to.be.ok
    expect(todo1.name).to.equal('T1')

    delete todo1.name
    todo1.$sync()

    expect(getStored(fs, todo1).done).to.equal(false)
    expect(getStored(fs, todo1).name).to.undefined

    $fiery.destroy()
  })

  it ('removes', function()
  {
    const fs = getStore('operations removes', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()
    const todo1: any = $fiery(fs.doc('todos/1'), 'todo')

    expect(todo1).to.be.ok
    expect(todo1.name).to.equal('T1')

    todo1.$remove()

    expect(getStored(fs, todo1)).to.be.undefined

    $fiery.destroy()
  })

  it ('removes subs', function()
  {
    const fs = getStore('operations removes subs', {
      'todos/1': { name: 'T1', done: false },
      'todos/1/children/1': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()
    const todo1: any = $fiery(fs.doc('todos/1'), 'todo')

    expect(todo1).to.be.ok
    expect(todo1.name).to.equal('T1')
    expect(todo1.children.length).to.equal(1)
    expect(todo1.children[0].name).to.equal('T2')

    const todo2: any = todo1.children[0]

    expect(getStored(fs, todo1)).to.be.ok
    expect(getStored(fs, todo2)).to.be.ok

    todo1.$remove()

    expect(getStored(fs, todo1)).to.be.undefined
    expect(getStored(fs, todo2)).to.be.undefined

    $fiery.destroy()
  })

  it ('clears', function()
  {
    const fs = getStore('operations clears', {
      'todos/1': { name: 'T1', done: false },
      'todos/1/children/1': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()
    const todo1: any = $fiery(fs.doc('todos/1'), 'todo')

    expect(todo1).to.be.ok
    expect(todo1.name).to.equal('T1')
    expect(todo1.children.length).to.equal(1)
    expect(todo1.children[0].name).to.equal('T2')

    const todo2: any = todo1.children[0]

    expect(getStored(fs, todo1)).to.be.ok
    expect(getStored(fs, todo2)).to.be.ok

    todo1.$clear(['name', 'children'])

    expect(getStored(fs, todo1)).to.be.ok
    expect(getStored(fs, todo1).name).to.be.undefined
    expect(getStored(fs, todo2)).to.be.undefined
    expect(todo1.children.length).to.equal(0)

    $fiery.destroy()
  })

  it ('getChanges', function(done)
  {
    const fs = getStore('operations getChange', {
      'todos/1': { name: 'T1', done: false },
      'todos/1/children/1': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()
    const todo1: any = $fiery(fs.doc('todos/1'), 'todo')

    expect(todo1).to.be.ok
    expect(todo1.name).to.equal('T1')

    todo1.name = 'T1a'
    todo1.$getChanges().then((changes: FieryChanges) => {

      expect(changes.changed).to.be.true
      expect(changes.remote).to.deep.equal({name: 'T1'})
      expect(changes.local).to.deep.equal({name: 'T1a'})

      $fiery.destroy()

      done()
    })
  })

  it ('getChanges none', function(done)
  {
    const fs = getStore('operations getChange none', {
      'todos/1': { name: 'T1', done: false },
      'todos/1/children/1': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()
    const todo1: any = $fiery(fs.doc('todos/1'), 'todo')

    expect(todo1).to.be.ok
    expect(todo1.name).to.equal('T1')

    todo1.name = 'T1'
    todo1.$getChanges().then((changes: FieryChanges) => {

      expect(changes.changed).to.be.false
      expect(changes.remote).to.deep.equal({})
      expect(changes.local).to.deep.equal({})

      $fiery.destroy()

      done()
    })
  })

  it ('getChanges specific', function(done)
  {
    const fs = getStore('operations getChange specific', {
      'todos/1': { name: 'T1', done: false },
      'todos/1/children/1': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()
    const todo1: any = $fiery(fs.doc('todos/1'), 'todo')

    expect(todo1).to.be.ok
    expect(todo1.name).to.equal('T1')
    expect(todo1.done).to.be.false

    todo1.name = 'T1a'
    todo1.done = true

    todo1.$getChanges(['name']).then((changes: FieryChanges) => {

      expect(changes.changed).to.be.true
      expect(changes.remote).to.deep.equal({name: 'T1'})
      expect(changes.local).to.deep.equal({name: 'T1a'})

      todo1.$getChanges('done').then((changes: FieryChanges) => {

        expect(changes.changed).to.be.true
        expect(changes.remote).to.deep.equal({done: false})
        expect(changes.local).to.deep.equal({done: true})

        todo1.$getChanges([]).then((changes: FieryChanges) => {

          expect(changes.changed).to.be.false

          $fiery.destroy()

          done()
        })
      })
    })
  })

  it('build', function() {
    const fs = getStore('operations build', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()

    const todos: any = $fiery(fs.collection('todos'), 'todo', 'todos')

    const todo3: any = $fiery.build('todos')

    expect(todo3).to.be.ok
    expect(todo3.name).to.equal('')
    expect(todo3.done).to.be.false
    expect(todo3.due).to.be.null
    expect(todo3.assigned_to).to.be.null

    expect(todos.length).to.equal(2)
    expect(getStored(fs, todo3)).to.be.undefined

    $fiery.destroy()
  })

  it('build initial', function() {
    const fs = getStore('operations build initial', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()

    const todos: any = $fiery(fs.collection('todos'), 'todo', 'todos')

    const todo3: any = $fiery.build('todos', {
      name: 'T3',
      due: new Date()
    })

    expect(todo3).to.be.ok
    expect(todo3.name).to.equal('T3')
    expect(todo3.done).to.be.false
    expect(todo3.due).to.be.ok
    expect(todo3.assigned_to).to.be.null

    expect(todos.length).to.equal(2)
    expect(getStored(fs, todo3)).to.be.undefined

    $fiery.destroy()
  })

  it('create', function() {
    const fs = getStore('operations create', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()

    const todos: any = $fiery(fs.collection('todos'), 'todo', 'todos')

    const todo3: any = $fiery.create('todos')

    expect(todo3).to.be.ok
    expect(todo3.name).to.equal('')
    expect(todo3.done).to.be.false
    expect(todo3.due).to.be.null
    expect(todo3.assigned_to).to.be.null

    expect(todos.length).to.equal(3)
    expect(getStored(fs, todo3)).to.be.ok
    expect(todos[2]).to.equal(todo3)

    $fiery.destroy()
  })

  it('create initial', function() {
    const fs = getStore('operations create initial', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()

    const todos: any = $fiery(fs.collection('todos'), 'todo', 'todos')

    const todo3: any = $fiery.create('todos', {
      name: 'T3',
      due: new Date()
    })

    expect(todo3).to.be.ok
    expect(todo3.name).to.equal('T3')
    expect(todo3.done).to.be.false
    expect(todo3.due).to.be.ok
    expect(todo3.assigned_to).to.be.null

    expect(todos.length).to.equal(3)
    expect(getStored(fs, todo3)).to.be.ok
    expect(todos[2]).to.equal(todo3)

    $fiery.destroy()
  })

  it('build sub', function() {
    const fs = getStore('operations build sub', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()

    const todos: any = $fiery(fs.collection('todos'), 'todo', 'todos')
    const todo1: any = todos[0]
    const todo3: any = todo1.$build('children')

    expect(todo3).to.be.ok
    expect(todo3.name).to.equal('')
    expect(todo3.done).to.be.false
    expect(todo3.due).to.be.null
    expect(todo3.assigned_to).to.be.null

    expect(todos.length).to.equal(2)
    expect(todo1.children.length).to.equal(0)
    expect(getStored(fs, todo3)).to.be.undefined

    $fiery.destroy()
  })

  it('build sub initial', function() {
    const fs = getStore('operations build sub initial', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()

    const todos: any = $fiery(fs.collection('todos'), 'todo', 'todos')

    const todo1: any = todos[0]
    const todo3: any = todo1.$build('children', {
      name: 'T3',
      due: new Date()
    })

    expect(todo3).to.be.ok
    expect(todo3.name).to.equal('T3')
    expect(todo3.done).to.be.false
    expect(todo3.due).to.be.ok
    expect(todo3.assigned_to).to.be.null

    expect(todos.length).to.equal(2)
    expect(todo1.children.length).to.equal(0)
    expect(getStored(fs, todo3)).to.be.undefined

    $fiery.destroy()
  })

  it('create sub', function() {
    const fs = getStore('operations create sub', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()

    const todos: any = $fiery(fs.collection('todos'), 'todo', 'todos')

    const todo1: any = todos[0]
    const todo3: any = todo1.$create('children')

    expect(todo3).to.be.ok
    expect(todo3.name).to.equal('')
    expect(todo3.done).to.be.false
    expect(todo3.due).to.be.null
    expect(todo3.assigned_to).to.be.null

    expect(todos.length).to.equal(2)
    expect(todo1.children.length).to.equal(1)
    expect(getStored(fs, todo3)).to.be.ok
    expect(todo1.children[0]).to.equal(todo3)

    $fiery.destroy()
  })

  it('create sub initial', function() {
    const fs = getStore('operations create sub initial', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true }
    })

    const $fiery = $getFiery()

    const todos: any = $fiery(fs.collection('todos'), 'todo', 'todos')

    const todo1: any = todos[0]
    const todo3: any = todo1.$create('children', {
      name: 'T3',
      due: new Date()
    })

    expect(todo3).to.be.ok
    expect(todo3.name).to.equal('T3')
    expect(todo3.done).to.be.false
    expect(todo3.due).to.be.ok
    expect(todo3.assigned_to).to.be.null

    expect(todos.length).to.equal(2)
    expect(todo1.children.length).to.equal(1)
    expect(getStored(fs, todo3)).to.be.ok
    expect(todo1.children[0]).to.equal(todo3)

    $fiery.destroy()
  })

})
