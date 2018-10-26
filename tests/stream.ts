
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/chai/index.d.ts" />

import $getFiery, { define, setGlobalOptions, getCacheForData } from '../src'
import { FierySource, FieryChanges, FieryOptions, FieryTarget, FieryEntry } from '../src/types'
import { globalOptions } from '../src/options'
import { getStore, getStored } from './util'
import { expect } from 'chai'

describe('stream', function()
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
        include: ['name', 'done', 'done_at', 'done_by', 'edited_at']
      }
    })
  })

  it('adds', function(done)
  {
    const fs = getStore('stream adds', {
      'tasks/1': { name: 'T1', done: true, edited_at: 1 },
      'tasks/2': { name: 'T2', done: false, edited_at: 2 },
      'tasks/3': { name: 'T3', done: false, edited_at: 3 },
      'tasks/4': { name: 'T4', done: false, edited_at: 4 },
      'tasks/5': { name: 'T5', done: false, edited_at: 5 },
      'tasks/6': { name: 'T6', done: false, edited_at: 6 },
      'tasks/7': { name: 'T7', done: false, edited_at: 7 },
      'tasks/8': { name: 'T8', done: false, edited_at: 8 }
    })

    const $fiery = $getFiery()

    const tasks: Task[] = $fiery(
      fs.collection('tasks'), {
      extends: 'task',
      query: q => q.orderBy('edited_at', 'desc'),
      stream: true,
      streamInitial: 2,
      streamMore: 2
    })

    const entry = $fiery.entryFor(tasks) as FieryEntry
    const promise = entry.promise as Promise<FieryTarget>

    promise.then(() => {

      expect(tasks.map(t => t.name)).to.deep.equal(['T8', 'T7'])

      fs.collection('tasks').add({
        name: 'T9', done: false, edited_at: 9
      })

      expect(tasks.map(t => t.name)).to.deep.equal(['T9', 'T8', 'T7'])

      $fiery.more(tasks, 2)

      const promise = entry.promise as Promise<FieryTarget>

      promise.then(() => {

        expect(tasks.map(t => t.name)).to.deep.equal(['T9', 'T8', 'T7', 'T6', 'T5'])

        fs.collection('tasks').doc('7').delete()

        expect(tasks.map(t => t.name)).to.deep.equal(['T9', 'T8', 'T6', 'T5'])

        $fiery.destroy()

        done()

      }, done)

    }, done)
  })

})
