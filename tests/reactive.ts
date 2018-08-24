
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/chai/index.d.ts" />

import $getFiery, { define, setGlobalOptions, getCacheForData } from '../src'
import { FierySource, FieryChanges, FieryOptions } from '../src/types'
import { globalOptions } from '../src/options'
import { getStore, getStored } from './util'
import { expect } from 'chai'

describe('reactive', function()
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
        }
      }
    })
  })

  it('collection reuses entry', function()
  {
    const fs = getStore('collection reuses entry', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true },
      'todos/3': { name: 'T3', done: false },
      'todos/4': { name: 'T4', done: true },
      'todos/5': { name: 'T5', done: true }
    })

    const $fiery = $getFiery()

    const getTodos = (done: boolean): any[] =>
    {
      const options: Partial<FieryOptions> = {
        extends: 'todo',
        query: q => q.where('done', '==', done)
      }

      return $fiery(fs.collection('todos'), options, 'todos')
    }

    let todos = getTodos(true)

    expect($fiery.entryList.length).to.equal(1)
    expect(todos).to.be.ok
    expect(todos.length).to.equal(3)

    const entry = $fiery.entryList[0]
    const todo2 = todos[0]
    const todo4 = todos[1]
    const todo5 = todos[2]

    expect(getCacheForData(todo2)).to.be.ok
    expect(getCacheForData(todo4)).to.be.ok
    expect(getCacheForData(todo5)).to.be.ok

    todos = getTodos(false)

    expect($fiery.entryList.length).to.equal(1)
    expect($fiery.entryList[0]).to.equal(entry)
    expect(todos).to.be.ok
    expect(todos.length).to.equal(2)

    expect(getCacheForData(todo2)).to.be.undefined
    expect(getCacheForData(todo4)).to.be.undefined
    expect(getCacheForData(todo5)).to.be.undefined

    $fiery.destroy()
  })

  it('map reuses entry', function()
  {
    const fs = getStore('map reuses entry', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true },
      'todos/3': { name: 'T3', done: false },
      'todos/4': { name: 'T4', done: true },
      'todos/5': { name: 'T5', done: true }
    })

    const $fiery = $getFiery()

    const getTodos = (done: boolean): any =>
    {
      const options: Partial<FieryOptions> = {
        extends: 'todo',
        map: true,
        query: q => q.where('done', '==', done)
      }

      return $fiery(fs.collection('todos'), options, 'todos')
    }

    let todos = getTodos(true)

    expect($fiery.entryList.length).to.equal(1)
    expect(todos).to.be.ok
    expect(todos).to.have.keys('2', '4', '5')

    const entry = $fiery.entryList[0]
    const todo2 = todos['2']
    const todo4 = todos['4']
    const todo5 = todos['5']

    expect(getCacheForData(todo2)).to.be.ok
    expect(getCacheForData(todo4)).to.be.ok
    expect(getCacheForData(todo5)).to.be.ok

    todos = getTodos(false)

    expect($fiery.entryList.length).to.equal(1)
    expect($fiery.entryList[0]).to.equal(entry)
    expect(todos).to.be.ok
    expect(todos).to.have.keys('1', '3')

    expect(getCacheForData(todo2)).to.be.undefined
    expect(getCacheForData(todo4)).to.be.undefined
    expect(getCacheForData(todo5)).to.be.undefined

    $fiery.destroy()
  })

  it('doc reuses entry', function()
  {
    const fs = getStore('map reuses entry', {
      'todos/1': { name: 'T1', done: false },
      'todos/2': { name: 'T2', done: true },
      'todos/3': { name: 'T3', done: false },
      'todos/4': { name: 'T4', done: true },
      'todos/5': { name: 'T5', done: true }
    })

    const $fiery = $getFiery()

    const getTodo = (id: string): any =>
    {
      return $fiery(fs.collection('todos').doc(id), 'todo', 'currentTodo')
    }

    let todo1 = getTodo('1')

    expect($fiery.entryList.length).to.equal(1)
    expect(todo1).to.be.ok
    expect(todo1.name).to.equal('T1')

    const entry = $fiery.entryList[0]

    expect(getCacheForData(todo1)).to.be.ok

    let todo2 = getTodo('2')

    expect($fiery.entryList.length).to.equal(1)
    expect($fiery.entryList[0]).to.equal(entry)
    expect(todo2).to.be.ok
    expect(todo2.name).to.equal('T2')
    expect(todo1).to.not.equal(todo2)

    expect(getCacheForData(todo1)).to.be.undefined
    expect(getCacheForData(todo2)).to.be.ok

    $fiery.destroy()
  })

})
