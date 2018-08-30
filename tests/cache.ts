
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/chai/index.d.ts" />

import $getFiery, { define, setGlobalOptions, getCacheForData } from '../src'
import { FierySource } from '../src/types'
import { globalOptions } from '../src/options'
import { getStore } from './util'
import { expect, assert } from 'chai'

describe('cache', function()
{

  before(function() {
    globalOptions.user = undefined
    globalOptions.defined = {}

    setGlobalOptions({
      record: true
    })

    define({
      post: {
        include: ['title', 'tags', 'content', 'author_id', 'created_at'],
        nullifyMissing: true,
        defaults: {
          title: '',
          content: '',
          tags: () => [],
          created_at: () => new Date()
        },
        sub: {
          comments: 'comment'
        }
      },
      comment: {
        include: ['content', 'author_id', 'created_at', 'likes', 'dislikes'],
        defaults: {
          likes: 0,
          dislikes: 0,
          created_at: () => new Date()
        },
        sub: {
          replies: 'comment'
        }
      },
      author: {
        key: 'id',
        include: ['role', 'name']
      },
      tag: {
        record: true,
        key: 'id',
        include: ['name']
      }
    })
  })

  it('clean on remove', function()
  {
    const fs = getStore('cache clean on remove', {
      'posts/1': { title: 'In a hole there lived a Hobbit', tags: ['1', '2'], content: 'Hello People', created_at: new Date(), author_id: '1' },
      'posts/1/comments/1': { content: 'Thank you!', author_id: '2', created_at: new Date(), likes: 1, dislikes: 0 },
      'posts/1/comments/1/replies/2': { content: 'You are welcome.', author_id: '1', created_at: new Date(), likes: 2, dislikes: 1 },
      'authors/1': { role: 'admin', name: 'ClickerMonkey' },
      'authors/2': { role: 'member', name: 'Random' },
      'tags/1': { name: 'Plan' },
      'tags/2': { name: 'Build' }
    })

    const $fiery = $getFiery()
    const posts: any = $fiery(fs.collection('posts'), 'post')

    // posts
    // posts/1/comments
    // posts/1/comments/1/replies
    // posts/1/comments/1/replies/2/replies
    expect($fiery.entryList.length).to.equal(4)

    const reply: any = posts[0].comments[0].replies[0]
    const replyCache: any = getCacheForData(reply)

    // reply was loaded
    expect(reply).to.be.ok
    expect(replyCache).to.be.ok
    expect(reply.content).to.equal('You are welcome.')
    expect($fiery.entry[ reply['.uid'] + '/replies' ]).to.be.ok
    expect($fiery.cache[ replyCache.uid ]).to.be.ok

    reply.$remove()

    // reply was removed from everything
    expect($fiery.entryList[3]).to.be.null
    expect($fiery.entry[ reply['.uid'] + '/replies' ]).to.be.undefined
    expect($fiery.cache[ replyCache.uid ]).to.be.undefined
    expect(getCacheForData(reply)).to.be.undefined

    $fiery.destroy()
  })

  it('in and out of scope', function()
  {
    const fs = getStore('cache in and out of scope', {
      'posts/1': { title: 'T1', tags: [1, 2], content: 'C1', created_at: new Date(3), author_id: '1' },
      'posts/2': { title: 'T2', tags: [1], content: 'C2', created_at: new Date(8), author_id: '1' },
      'posts/3': { title: 'T3', tags: [2], content: 'C3', created_at: new Date(5), author_id: '1' },
      'posts/4': { title: 'T4', tags: [1, 3], content: 'C4', created_at: new Date(1), author_id: '1' },
      'posts/5': { title: 'T5', tags: [3, 2], content: 'C5', created_at: new Date(10), author_id: '1' }
    })

    const $fiery = $getFiery()
    const posts: any = $fiery(fs.collection('posts'), {
      extends: 'post',
      query: (q) => q.where('tags', <any>'array_contains', 1).orderBy('created_at')
    })

    expect(posts.length).to.equal(3)
    expect(posts[0].title).to.equal('T4')
    expect(posts[1].title).to.equal('T1')
    expect(posts[2].title).to.equal('T2')

    const p0 = posts[0]
    const p1 = posts[1]
    const p2 = posts[2]
    const p1Cache: any = getCacheForData(p1)

    expect(p1Cache).to.be.ok
    expect(p1Cache.uses).to.equal(1)
    expect($fiery.cache[p1Cache.uid]).to.be.ok

    p1.tags = [2]
    p1.$update()

    expect(posts.length).to.equal(2)
    expect(posts[0]).to.equal(p0)
    expect(posts[1]).to.equal(p2)
    expect(posts[0].title).to.equal('T4')
    expect(posts[1].title).to.equal('T2')

    expect(p1Cache).to.be.ok
    expect(p1Cache.uses).to.equal(0)
    expect($fiery.cache[p1Cache.uid]).to.be.undefined
    expect(getCacheForData(p1)).to.be.undefined

    $fiery.destroy()
  })

  it('in and out of scope partly', function()
  {
    const fs = getStore('cache in and out of scope partly', {
      'posts/1': { title: 'T1', tags: [1, 2], content: 'C1', created_at: new Date(3), author_id: '1' },
      'posts/2': { title: 'T2', tags: [1], content: 'C2', created_at: new Date(8), author_id: '1' },
      'posts/3': { title: 'T3', tags: [2], content: 'C3', created_at: new Date(5), author_id: '1' },
      'posts/4': { title: 'T4', tags: [1, 3], content: 'C4', created_at: new Date(1), author_id: '1' },
      'posts/5': { title: 'T5', tags: [3, 2], content: 'C5', created_at: new Date(10), author_id: '1' }
    })

    const $fiery = $getFiery()
    const posts: any = $fiery(fs.collection('posts'), {
      extends: 'post',
      query: (q) => q.where('tags', <any>'array_contains', 1).orderBy('created_at')
    })
    const post1: any = $fiery(fs.doc('posts/1'), 'post')

    expect(posts.length).to.equal(3)
    expect(posts[0].title).to.equal('T4')
    expect(posts[1].title).to.equal('T1')
    expect(posts[2].title).to.equal('T2')

    const p0 = posts[0]
    const p1 = posts[1]
    const p2 = posts[2]
    const p1Cache: any = getCacheForData(p1)

    expect(p1Cache).to.be.ok
    expect(p1Cache.uses).to.equal(1)
    expect($fiery.cache[p1Cache.uid]).to.be.ok
    expect(p1Cache.entries.length).to.equal(2)

    p1.tags = [2]
    p1.$update()

    expect(posts.length).to.equal(2)
    expect(posts[0]).to.equal(p0)
    expect(posts[1]).to.equal(p2)
    expect(posts[0].title).to.equal('T4')
    expect(posts[1].title).to.equal('T2')

    expect(p1Cache.entries.length).to.equal(1)
    expect(p1Cache).to.be.ok
    expect(p1Cache.uses).to.equal(1)
    expect($fiery.cache[p1Cache.uid]).to.be.ok
    expect(getCacheForData(p1)).to.be.ok

    p1.$remove()

    expect(p1Cache.uses).to.equal(0)
    expect($fiery.cache[p1Cache.uid]).to.be.undefined
    expect(getCacheForData(p1)).to.be.undefined

    $fiery.destroy()
  })

  it('multiple instances', function()
  {
    const fs = getStore('cache multiple instances', {
      'posts/1': { title: 'T1', tags: [1, 2], content: 'C1', created_at: new Date(3), author_id: '1' },
      'posts/2': { title: 'T2', tags: [1], content: 'C2', created_at: new Date(8), author_id: '1' },
      'posts/3': { title: 'T3', tags: [2], content: 'C3', created_at: new Date(5), author_id: '1' },
      'posts/4': { title: 'T4', tags: [1, 3], content: 'C4', created_at: new Date(1), author_id: '1' },
      'posts/5': { title: 'T5', tags: [3, 2], content: 'C5', created_at: new Date(10), author_id: '1' }
    })

    const $fiery1 = $getFiery()
    const $fiery2 = $getFiery()

    const posts: any = $fiery1(fs.collection('posts'), {
      extends: 'post',
      query: (q) => q.where('tags', <any>'array_contains', 1).orderBy('created_at')
    })
    const post1: any = $fiery2(fs.doc('posts/1'), 'post')

    expect(posts.length).to.equal(3)
    expect(posts[0].title).to.equal('T4')
    expect(posts[1].title).to.equal('T1')
    expect(posts[2].title).to.equal('T2')

    const p0 = posts[0]
    const p1 = posts[1]
    const p2 = posts[2]
    const p1Cache: any = getCacheForData(p1)

    expect(p1Cache).to.be.ok
    expect(p1Cache.uses).to.equal(2) // 2 instances!
    expect($fiery1.cache[p1Cache.uid]).to.be.ok
    expect($fiery2.cache[p1Cache.uid]).to.be.ok
    expect(p1Cache.entries.length).to.equal(2)

    p1.tags = [2]
    p1.$update()

    expect(posts.length).to.equal(2)
    expect(posts[0]).to.equal(p0)
    expect(posts[1]).to.equal(p2)
    expect(posts[0].title).to.equal('T4')
    expect(posts[1].title).to.equal('T2')

    expect(p1Cache.entries.length).to.equal(1)
    expect(p1Cache.uses).to.equal(1)
    expect($fiery1.cache[p1Cache.uid]).to.be.undefined
    expect($fiery2.cache[p1Cache.uid]).to.be.ok
    expect(getCacheForData(p1)).to.be.ok

    p1.$remove()

    expect(p1Cache.uses).to.equal(0)
    expect($fiery2.cache[p1Cache.uid]).to.be.undefined
    expect(getCacheForData(p1)).to.be.undefined

    $fiery1.destroy()
    $fiery2.destroy()
  })

})
