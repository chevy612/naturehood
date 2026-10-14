import assert from 'node:assert/strict'
import test from 'node:test'
import { parseCreateComment, parseCreatePost } from './validation'

test('a comment accepts three images and rejects a fourth or a mix', () => {
  const three = parseCreateComment({
    content: 'photos',
    images: ['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg'],
    videos: [],
  })
  assert.equal(three.images?.length, 3)

  assert.throws(
    () => parseCreateComment({
      content: 'photos',
      images: ['a', 'b', 'c', 'd'],
    }),
    /at most 3 images/
  )
  assert.throws(
    () => parseCreateComment({
      content: 'clips',
      videos: ['a', 'b', 'c', 'd'],
    }),
    /at most 3 videos/
  )
  assert.throws(
    () => parseCreateComment({
      content: 'both',
      images: ['https://example.com/1.jpg'],
      videos: ['https://example.com/1.mp4'],
    }),
    /not both/
  )
})

test('a comment can be media without text, and posts keep their own image cap', async () => {
  const mediaOnly = parseCreateComment({ content: '', images: ['https://example.com/1.jpg'], videos: [] })
  assert.equal(mediaOnly.content, '')

  assert.throws(
    () => parseCreatePost({ content: '', images: ['a', 'b', 'c', 'd', 'e'] }),
    /at most 4 images/
  )
})
