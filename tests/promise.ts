
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/chai/index.d.ts" />

import $getFiery, { define, setGlobalOptions, getCacheForData } from '../src'
import { FierySource, FieryChanges, FieryOptions, FieryEntry } from '../src/types'
import { globalOptions } from '../src/options'
import { getStore, getStored } from './util'
import { expect } from 'chai'

describe('promise', function()
{

  before(function() {
    globalOptions.user = undefined
    globalOptions.defined = {}
  })

  it('document once', function(done)
  {
    const fs = getStore('promise document once', {
      'tasks/1': { name: 'T1', done: true, edited_at: 3 },
      'tasks/2': { name: 'T2', done: false, edited_at: 5 },
      'tasks/3': { name: 'T3', done: false, edited_at: 1 }
    })

    const $fiery = $getFiery()

    const todo: any = $fiery(fs.doc('tasks/1'), {once: true}, 'todo')
    const entry: FieryEntry | null = $fiery.entryFor('todo')

    expect(entry).to.be.ok

    if (entry) {
      expect(entry.promise).to.be.ok

      if (entry.promise) {
        entry.promise.then(result => {
          expect(todo).to.equal(result)
          $fiery.destroy()
          done()
        })
      }
    }
  })

  it('document live', function(done)
  {
    const fs = getStore('promise document live', {
      'tasks/1': { name: 'T1', done: true, edited_at: 3 },
      'tasks/2': { name: 'T2', done: false, edited_at: 5 },
      'tasks/3': { name: 'T3', done: false, edited_at: 1 }
    })

    const $fiery = $getFiery()

    const todo: any = $fiery(fs.doc('tasks/1'), {once: false}, 'todo')
    const entry: FieryEntry | null = $fiery.entryFor('todo')

    expect(entry).to.be.ok

    if (entry) {
      expect(entry.promise).to.be.ok

      if (entry.promise) {
        entry.promise.then(result => {
          expect(todo).to.equal(result)
          $fiery.destroy()
          done()
        })
      }
    }
  })

  it('collection once', function(done)
  {
    const fs = getStore('promise collection once', {
      'tasks/1': { name: 'T1', done: true, edited_at: 3 },
      'tasks/2': { name: 'T2', done: false, edited_at: 5 },
      'tasks/3': { name: 'T3', done: false, edited_at: 1 }
    })

    const $fiery = $getFiery()

    const todos: any = $fiery(fs.doc('tasks'), {once: true}, 'todos')
    const entry: FieryEntry | null = $fiery.entryFor('todos')

    expect(entry).to.be.ok

    if (entry) {
      expect(entry.promise).to.be.ok

      if (entry.promise) {
        entry.promise.then(result => {
          expect(todos).to.equal(result)
          $fiery.destroy()
          done()
        })
      }
    }
  })

  it('collection live', function(done)
  {
    const fs = getStore('promise collection live', {
      'tasks/1': { name: 'T1', done: true, edited_at: 3 },
      'tasks/2': { name: 'T2', done: false, edited_at: 5 },
      'tasks/3': { name: 'T3', done: false, edited_at: 1 }
    })

    const $fiery = $getFiery()

    const todos: any = $fiery(fs.doc('tasks'), {once: false}, 'todos')
    const entry: FieryEntry | null = $fiery.entryFor('todos')

    expect(entry).to.be.ok

    if (entry) {
      expect(entry.promise).to.be.ok

      if (entry.promise) {
        entry.promise.then(result => {
          expect(todos).to.equal(result)
          $fiery.destroy()
          done()
        })
      }
    }
  })

  it('map once', function(done)
  {
    const fs = getStore('promise map once', {
      'tasks/1': { name: 'T1', done: true, edited_at: 3 },
      'tasks/2': { name: 'T2', done: false, edited_at: 5 },
      'tasks/3': { name: 'T3', done: false, edited_at: 1 }
    })

    const $fiery = $getFiery()

    const todos: any = $fiery(fs.doc('tasks'), {once: true, map: true}, 'todos')
    const entry: FieryEntry | null = $fiery.entryFor('todos')

    expect(entry).to.be.ok

    if (entry) {
      expect(entry.promise).to.be.ok

      if (entry.promise) {
        entry.promise.then(result => {
          expect(todos).to.equal(result)
          $fiery.destroy()
          done()
        })
      }
    }
  })

  it('map live', function(done)
  {
    const fs = getStore('promise map live', {
      'tasks/1': { name: 'T1', done: true, edited_at: 3 },
      'tasks/2': { name: 'T2', done: false, edited_at: 5 },
      'tasks/3': { name: 'T3', done: false, edited_at: 1 }
    })

    const $fiery = $getFiery()

    const todos: any = $fiery(fs.doc('tasks'), {once: false, map: true}, 'todos')
    const entry: FieryEntry | null = $fiery.entryFor('todos')

    expect(entry).to.be.ok

    if (entry) {
      expect(entry.promise).to.be.ok

      if (entry.promise) {
        entry.promise.then(result => {
          expect(todos).to.equal(result)
          $fiery.destroy()
          done()
        })
      }
    }
  })
})
