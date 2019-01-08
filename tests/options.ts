
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/chai/index.d.ts" />

import $getFiery from '../src'
import { globalOptions } from '../src/options'
import { getStore, getStored, getTimestamp } from './util'
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

    context.task = $fiery(fs.doc('tasks/2'), options, 'task')

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

  it('timestamps', function() {

    const d1 = null
    const d2 = 456
    const d3 = new Date(789)
    const d4 = getTimestamp(123, 0)

    const fs = getStore('options timestamps', {
      'tasks/1': {
        name: 'T1',
        done: false,
        done_at: d1,
        created_at: d2,
        updated_at: d3,
        named_at: d4
      }
    })

    const $fiery = $getFiery()

    const options = {
      timestamps: ['done_at', 'created_at', 'updated_at', 'named_at']
    }

    const task: any = $fiery(fs.doc('tasks/1'), options, 'task')

    expect(task.done_at).to.be.null
    expect(task.created_at).to.be.an.instanceof(Date)
    expect(task.updated_at).to.be.an.instanceof(Date)
    expect(task.named_at).to.be.an.instanceof(Date)
    expect(task.created_at.getTime()).to.equal(456)
    expect(task.updated_at.getTime()).to.equal(789)
    expect(task.named_at.getTime()).to.equal(123000)

    $fiery.destroy()
  })

  it('events', async function()
  {
    const fs = getStore('options events', {
      'tasks/1': { name: 'T1', done: false, done_at: null, done_by: null },
      'tasks/2': { name: 'T2', done: true, done_at: 123, done_by: 456 }
    })

    const $fiery = $getFiery()

    const counters = { remove: 0, missing: 0, create: 0, destroy: 0, update: 0 }

    class Task {
      name: string
      done: boolean
      done_at: number
      done_by: number
      exists: boolean
      $onRemove() {
        counters.remove++
      }
      $onMissing() {
        counters.missing++
      }
      $onCreate() {
        counters.create++
      }
      $onDestroy() {
        counters.destroy++
      }
      $onUpdate() {
        counters.update++
      }
    }

    const options = {
      type: Task,
      propExists: 'exists',
      events: true
    }

    const tasks: Task[] = $fiery(fs.collection('tasks'), options, 'task')

    expect(tasks.length).to.equal(2)
    expect(counters).to.deep.equal({remove: 0, missing: 0, create: 2, destroy: 0, update: 2})

    fs.doc('tasks/1').update({name: 'T1a'})

    expect(tasks[0].name).to.equal('T1a')
    expect(counters).to.deep.equal({remove: 0, missing: 0, create: 2, destroy: 0, update: 3})

    fs.doc('tasks/2').delete()

    expect(tasks.length).to.equal(1)
    expect(counters).to.deep.equal({remove: 1, missing: 0, create: 2, destroy: 1, update: 3})

    fs.collection('tasks').add({
      name: 'T3',
      done: false
    })

    expect(tasks.length).to.equal(2)
    expect(counters).to.deep.equal({remove: 1, missing: 0, create: 3, destroy: 1, update: 4})

    const task4: Task = $fiery(fs.doc('tasks/4'), options, 'task4')

    expect(task4).to.be.ok
    expect(task4.exists).to.be.false
    expect(tasks.length).to.equal(2)
    expect(counters).to.deep.equal({remove: 1, missing: 1, create: 4, destroy: 1, update: 4})

    task4.name = 'T4'
    task4.done = false

    return $fiery.save(task4).then(() =>
    {
      expect(task4.exists).to.be.true
      expect(tasks.length).to.equal(3)
      expect(counters).to.deep.equal({remove: 1, missing: 1, create: 4, destroy: 1, update: 6})

      $fiery.destroy()

      expect(counters).to.deep.equal({remove: 1, missing: 1, create: 4, destroy: 4, update: 6})
    })
  })

  it('events override', async function()
  {
    const fs = getStore('options events override', {
      'tasks/1': { name: 'T1', done: false, done_at: null, done_by: null },
      'tasks/2': { name: 'T2', done: true, done_at: 123, done_by: 456 }
    })

    const $fiery = $getFiery()

    const counters = { remove: 0, missing: 0, create: 0, destroy: 0, update: 0 }

    class Task {
      name: string
      done: boolean
      done_at: number
      done_by: number
      exists: boolean
      removed() {
        counters.remove++
      }
      missing() {
        counters.missing++
      }
      init() {
        counters.create++
      }
      destroy() {
        counters.destroy++
      }
      updated() {
        counters.update++
      }
    }

    const options = {
      type: Task,
      propExists: 'exists',
      events: true,
      eventsOptions: {
        remove: 'removed',
        missing: 'missing',
        create: 'init',
        destroy: 'destroy',
        update: 'updated'
      }
    }

    const tasks: Task[] = $fiery(fs.collection('tasks'), options, 'task')

    expect(tasks.length).to.equal(2)
    expect(counters).to.deep.equal({remove: 0, missing: 0, create: 2, destroy: 0, update: 2})

    fs.doc('tasks/1').update({name: 'T1a'})

    expect(tasks[0].name).to.equal('T1a')
    expect(counters).to.deep.equal({remove: 0, missing: 0, create: 2, destroy: 0, update: 3})

    fs.doc('tasks/2').delete()

    expect(tasks.length).to.equal(1)
    expect(counters).to.deep.equal({remove: 1, missing: 0, create: 2, destroy: 1, update: 3})

    fs.collection('tasks').add({
      name: 'T3',
      done: false
    })

    expect(tasks.length).to.equal(2)
    expect(counters).to.deep.equal({remove: 1, missing: 0, create: 3, destroy: 1, update: 4})

    const task4: Task = $fiery(fs.doc('tasks/4'), options, 'task4')

    expect(task4).to.be.ok
    expect(task4.exists).to.be.false
    expect(tasks.length).to.equal(2)
    expect(counters).to.deep.equal({remove: 1, missing: 1, create: 4, destroy: 1, update: 4})

    task4.name = 'T4'
    task4.done = false

    return $fiery.save(task4).then(() =>
    {
      expect(task4.exists).to.be.true
      expect(tasks.length).to.equal(3)
      expect(counters).to.deep.equal({remove: 1, missing: 1, create: 4, destroy: 1, update: 6})

      $fiery.destroy()

      expect(counters).to.deep.equal({remove: 1, missing: 1, create: 4, destroy: 4, update: 6})
    })
  })

})
