
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/chai/index.d.ts" />

import $getFiery, { define, setGlobalOptions } from '../src'
import { globalOptions } from '../src/options'
import { getStore } from './util'
import { expect } from 'chai'

describe('collection', function()
{

  class Task {
    name: string = ''
    done: boolean = false
    done_at: number | null = null
    done_by: string | null = null
    edited_at: number = 0

    public finish (now: number): void {
      this.done = true
      this.done_at = now
      this.done_by = 'Me'
      this.edited_at = now
      this.save()
    }

    public save: () => Promise<void>
    public remove: () => Promise<void>
  }

  before(function() {
    globalOptions.user = undefined
    globalOptions.defined = {}

    setGlobalOptions({
      record: true,
      recordOptions: {
        update: 'save',
        remove: 'remove'
      }
    })

    define({
      task: {
        type: Task,
        include: ['name', 'done', 'done_at', 'done_by', 'edited_at'],
        query: q => q.orderBy('edited_at', 'desc')
      }
    })
  })

  it('remove last', function()
  {
    const fs = getStore('collection remove last', {
      'tasks/1': { name: 'T1', done: true, edited_at: 3 },
      'tasks/2': { name: 'T2', done: false, edited_at: 5 },
      'tasks/3': { name: 'T3', done: false, edited_at: 1 }
    })

    const $fiery = $getFiery()

    const tasks: Task[] = $fiery(fs.collection('tasks'), 'task')

    const t2 = tasks[0]
    const t1 = tasks[1]
    const t3 = tasks[2]

    expect(tasks.length).to.equal(3)

    t3.remove()

    expect(tasks.length).to.equal(2)
    expect(tasks[0]).to.equal(t2)
    expect(tasks[1]).to.equal(t1)

    $fiery.destroy()
  })

  it('remove first', function()
  {
    const fs = getStore('collection remove first', {
      'tasks/1': { name: 'T1', done: true, edited_at: 3 },
      'tasks/2': { name: 'T2', done: false, edited_at: 5 },
      'tasks/3': { name: 'T3', done: false, edited_at: 1 }
    })

    const $fiery = $getFiery()

    const tasks: Task[] = $fiery(fs.collection('tasks'), 'task')

    const t2 = tasks[0]
    const t1 = tasks[1]
    const t3 = tasks[2]

    expect(tasks.length).to.equal(3)

    t2.remove()

    expect(tasks.length).to.equal(2)
    expect(tasks[0]).to.equal(t1)
    expect(tasks[1]).to.equal(t3)

    $fiery.destroy()
  })

  it('remove middle', function()
  {
    const fs = getStore('collection remove middle', {
      'tasks/1': { name: 'T1', done: true, edited_at: 3 },
      'tasks/2': { name: 'T2', done: false, edited_at: 5 },
      'tasks/3': { name: 'T3', done: false, edited_at: 1 }
    })

    const $fiery = $getFiery()

    const tasks: Task[] = $fiery(fs.collection('tasks'), 'task')

    const t2 = tasks[0]
    const t1 = tasks[1]
    const t3 = tasks[2]

    expect(tasks.length).to.equal(3)

    t1.remove()

    expect(tasks.length).to.equal(2)
    expect(tasks[0]).to.equal(t2)
    expect(tasks[1]).to.equal(t3)

    $fiery.destroy()
  })

  it('create first', function()
  {
    const fs = getStore('collection create first', {
      'tasks/1': { name: 'T1', done: true, edited_at: 3 },
      'tasks/2': { name: 'T2', done: false, edited_at: 5 },
      'tasks/3': { name: 'T3', done: false, edited_at: 1 }
    })

    const $fiery = $getFiery()

    const tasks: Task[] = $fiery(fs.collection('tasks'), 'task')

    const t2 = tasks[0]
    const t1 = tasks[1]
    const t3 = tasks[2]

    expect(tasks.length).to.equal(3)

    const t4: Task = $fiery.create(tasks, {
      edited_at: 8,
      name: 'T4'
    })

    expect(tasks.length).to.equal(4)
    expect(tasks[0]).to.equal(t4)
    expect(tasks[1]).to.equal(t2)
    expect(tasks[2]).to.equal(t1)
    expect(tasks[3]).to.equal(t3)

    $fiery.destroy()
  })

  it('create middle', function()
  {
    const fs = getStore('collection create middle', {
      'tasks/1': { name: 'T1', done: true, edited_at: 3 },
      'tasks/2': { name: 'T2', done: false, edited_at: 5 },
      'tasks/3': { name: 'T3', done: false, edited_at: 1 }
    })

    const $fiery = $getFiery()

    const tasks: Task[] = $fiery(fs.collection('tasks'), 'task')

    const t2 = tasks[0]
    const t1 = tasks[1]
    const t3 = tasks[2]

    expect(tasks.length).to.equal(3)

    const t4: Task = $fiery.create(tasks, {
      edited_at: 4,
      name: 'T4'
    })

    expect(tasks.length).to.equal(4)
    expect(tasks[0]).to.equal(t2)
    expect(tasks[1]).to.equal(t4)
    expect(tasks[2]).to.equal(t1)
    expect(tasks[3]).to.equal(t3)

    $fiery.destroy()
  })

  it('create last', function()
  {
    const fs = getStore('collection create last', {
      'tasks/1': { name: 'T1', done: true, edited_at: 3 },
      'tasks/2': { name: 'T2', done: false, edited_at: 5 },
      'tasks/3': { name: 'T3', done: false, edited_at: 1 }
    })

    const $fiery = $getFiery()

    const tasks: Task[] = $fiery(fs.collection('tasks'), 'task')

    const t2 = tasks[0]
    const t1 = tasks[1]
    const t3 = tasks[2]

    expect(tasks.length).to.equal(3)

    const t4: Task = $fiery.create(tasks, {
      edited_at: 0,
      name: 'T4'
    })

    expect(tasks.length).to.equal(4)
    expect(tasks[0]).to.equal(t2)
    expect(tasks[1]).to.equal(t1)
    expect(tasks[2]).to.equal(t3)
    expect(tasks[3]).to.equal(t4)

    $fiery.destroy()
  })

  it('update middle', function()
  {
    const fs = getStore('collection update middle', {
      'tasks/1': { name: 'T1', done: true, edited_at: 3 },
      'tasks/2': { name: 'T2', done: false, edited_at: 5 },
      'tasks/3': { name: 'T3', done: false, edited_at: 1 }
    })

    const $fiery = $getFiery()

    const tasks: Task[] = $fiery(fs.collection('tasks'), 'task')

    const t2 = tasks[0]
    const t1 = tasks[1]
    const t3 = tasks[2]

    expect(tasks.length).to.equal(3)

    t1.finish(7)

    expect(tasks.length).to.equal(3)
    expect(tasks[0]).to.equal(t1)
    expect(tasks[1]).to.equal(t2)
    expect(tasks[2]).to.equal(t3)

    $fiery.destroy()
  })

})
