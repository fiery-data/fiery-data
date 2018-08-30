
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/chai/index.d.ts" />

import $getFiery, { define, setGlobalOptions, getCacheForData } from '../src'
import { FierySource } from '../src/types'
import { globalOptions } from '../src/options'
import { getStore, getStored } from './util'
import { expect } from 'chai'

describe('options', function()
{

  before(function() {
    globalOptions.user = undefined
    globalOptions.defined = {}
  })

  it('type', function() {

    class Task {
      name: string = ''
      done: boolean = false
      done_at: number | null = null
      done_by: string | null = null

      public finish (now: number): void {
        this.done = true
        this.done_at = now
        this.done_by = 'Me'
        this.$update()
      }

      public $update(): void {} // set by fiery-data
    }

    const fs = getStore('options type', {
      'tasks/1': { name: 'T1', done: false, done_at: null, done_by: null }
    })

    const $fiery = $getFiery()

    const task: Task = $fiery(fs.doc('tasks/1'), {
      type: Task,
      record: true
    })

    const now = Date.now()
    const stored1 = getStored(fs, task)

    expect(task instanceof Task).to.be.true
    expect(stored1.name).to.equal('T1')
    expect(stored1.done).to.be.false
    expect(stored1.done_at).to.be.null
    expect(stored1.done_by).to.be.null

    task.finish(now)

    const stored2 = getStored(fs, task)
    expect(stored2.name).to.equal('T1')
    expect(stored2.done).to.be.true
    expect(stored2.done_at).to.equal(now)
    expect(stored2.done_by).to.equal('Me')

    $fiery.destroy()
  })

  it('propExists', function() {

    const fs = getStore('options propExists', {
      'tasks/1': { name: 'T1', done: false, done_at: null, done_by: null }
    })

    const $fiery = $getFiery()

    const task1: any = $fiery(fs.doc('tasks/1'), {
      propExists: 'exists'
    })

    expect(task1.exists).to.be.true

    $fiery.remove(task1)

    expect(task1.exists).to.be.false

    const task2: any = $fiery(fs.doc('tasks/2'), {
      propExists: 'exists'
    })

    expect(task2.exists).to.be.false

    $fiery.destroy()
  })

  it('propParent', function() {

    const fs = getStore('options propParent', {
      'tasks/1': { name: 'T1', done: false, done_at: null, done_by: null },
      'tasks/1/assigned/1': {name: 'A1'},
      'tasks/1/assigned/2': {name: 'A1'}
    })

    const $fiery = $getFiery()

    const task1: any = $fiery(fs.doc('tasks/1'), {
      sub: {
        assigned: {
          propParent: 'parent'
        }
      }
    })

    expect(task1.assigned).to.be.ok
    expect(task1.assigned.length).to.equal(2)
    expect(task1.assigned[0].parent).to.equal(task1)
    expect(task1.assigned[1].parent).to.equal(task1)

    $fiery.destroy()
  })

  it('nullifyMissing true', function() {

    const fs = getStore('options nullifyMissing true', {
      'tasks/1': { name: 'T1', done: false, done_at: null, done_by: null }
    })

    const context: any = {}

    const $fiery = $getFiery({
      removeNamed(name: string) {
        context[name] = null
      }
    })

    const options = {
      nullifyMissing: true,
      propExists: 'exists'
    }

    const task = context.task = $fiery(fs.doc('tasks/2'), options, 'task')

    expect(context.task).to.be.null

    $fiery.destroy()
  })

  it('nullifyMissing false', function() {

    const fs = getStore('options nullifyMissing false', {
      'tasks/1': { name: 'T1', done: false, done_at: null, done_by: null }
    })

    const context: any = {}

    const $fiery = $getFiery({
      removeNamed(name: string) {
        context[name] = null
      }
    })

    const options = {
      nullifyMissing: false,
      propExists: 'exists'
    }

    context.task = $fiery(fs.doc('tasks/2'), options, 'task')

    expect(context.task).to.be.ok
    expect(context.task.exists).to.be.false

    context.task.name = 'T2'

    $fiery.sync(context.task)

    expect(context.task.exists).to.be.true

    $fiery.destroy()
  })

})
