import assert from 'node:assert/strict'
import test from 'node:test'
import type { NotificationDto } from '@/lib/social/notifications'
import { isModeNotification } from './messages'
import { buildShareUrl, resolveShareOrigin } from './share-url'

function note(type: string, athleteId: string | null): NotificationDto {
  return {
    id: type,
    actorUserId: 'actor',
    type,
    postId: null,
    commentId: null,
    logCommentId: athleteId ? 'comment' : null,
    logType: athleteId ? 'workout' : null,
    logId: athleteId ? 'log' : null,
    athleteId,
    createdAt: '2026-10-15T12:00:00Z',
    readAt: null,
  }
}

test('athlete messages are comments and likes on that athlete\'s own logs', () => {
  const me = 'me'
  assert.equal(isModeNotification(note('log_comment', me), 'athlete', me), true)
  assert.equal(isModeNotification(note('log_reply', me), 'athlete', me), true)
  assert.equal(isModeNotification(note('log_comment_like', me), 'athlete', me), true)
  assert.equal(isModeNotification(note('log_comment', 'other'), 'athlete', me), false)
  assert.equal(isModeNotification(note('share_invite', null), 'athlete', me), false)
  assert.equal(isModeNotification(note('like', null), 'athlete', me), false)
})

test('coach messages are invites and activity on other athletes\' logs', () => {
  const me = 'me'
  assert.equal(isModeNotification(note('share_invite', null), 'coach', me), true)
  assert.equal(isModeNotification(note('log_reply', 'athlete'), 'coach', me), true)
  assert.equal(isModeNotification(note('log_comment_like', 'athlete'), 'coach', me), true)
  assert.equal(isModeNotification(note('log_comment', me), 'coach', me), false)
  assert.equal(isModeNotification(note('log_reply', me), 'coach', me), false)
})

test('share links use a public https origin phones can resolve', () => {
  const canonical = 'https://naturehoodofficial.com'
  assert.equal(resolveShareOrigin('https://naturehoodofficial.com', canonical), 'https://naturehoodofficial.com')
  assert.equal(resolveShareOrigin('https://preview.vercel.app', canonical), 'https://preview.vercel.app')
  assert.equal(resolveShareOrigin('http://localhost:3000', canonical), canonical)
  assert.equal(resolveShareOrigin('http://192.168.1.8:3000', canonical), canonical)
  assert.equal(resolveShareOrigin('https://app.naturehoodofficial.com', canonical), canonical)
  assert.equal(resolveShareOrigin('capacitor://localhost', canonical), canonical)
  assert.equal(resolveShareOrigin(null, 'http://localhost:3000'), canonical)
  assert.equal(buildShareUrl('abc123', 'http://localhost:3000', canonical), `${canonical}/share/abc123`)
})
