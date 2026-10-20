import assert from 'node:assert/strict'
import test from 'node:test'
import { readBefore } from './http'
import {
  initialNotificationsState,
  mergeFirstPage,
  notificationHref,
  notificationsReducer,
  notificationText,
  type NotificationDto,
  type NotificationsState,
} from './notifications'

function make(id: string, minutesAgo: number, readAt: string | null = null, type = 'like'): NotificationDto {
  return {
    id,
    actorUserId: 'actor',
    type,
    postId: 'post-1',
    commentId: null,
    logCommentId: null,
    logType: null,
    logId: null,
    athleteId: null,
    createdAt: new Date(Date.UTC(2026, 9, 15, 12, 0, 0) - minutesAgo * 60_000).toISOString(),
    readAt,
  }
}

function withItems(items: NotificationDto[], unreadCount: number): NotificationsState {
  return { ...initialNotificationsState, items, unreadCount, status: 'ready' }
}

test('post events open the post, follows open the actor profile, log events open the comment thread', () => {
  assert.equal(notificationHref({ type: 'like', postId: 'p1', actorUserId: 'u1' }), '/home/post/p1')
  assert.equal(notificationHref({ type: 'comment', postId: 'p1', actorUserId: 'u1' }), '/home/post/p1')
  assert.equal(notificationHref({ type: 'reply', postId: 'p1', actorUserId: 'u1' }), '/home/post/p1')
  assert.equal(notificationHref({ type: 'like', postId: null, actorUserId: 'u1' }), null)
  assert.equal(notificationHref({ type: 'follow', postId: null, actorUserId: 'u1' }), '/home/profile/u1')
  assert.equal(notificationHref({ type: 'share_invite', postId: null, actorUserId: 'u1' }), '/my-team/message#invitations')
  assert.equal(notificationHref({ type: 'share_accepted', postId: null, actorUserId: 'u1' }), '/my-team/sharing')
  assert.equal(notificationHref({ type: 'share_declined', postId: null, actorUserId: 'u1' }), '/my-team/sharing')
  assert.equal(
    notificationHref({ type: 'log_comment', postId: null, actorUserId: 'u1', logType: 'workout', logId: 'log-1', athleteId: 'ath-1' }),
    '/my-team/athletes/ath-1/logs/workout/log-1?tab=comments',
  )
  assert.equal(notificationHref({ type: 'log_comment', postId: null, actorUserId: 'u1' }), null)
  assert.match(notificationText('log_comment'), /commented on your log/)
  assert.match(notificationText('log_comment_like'), /liked a comment/)
})

test('sharing events read as record sharing invitations', () => {
  assert.match(notificationText('share_invite'), /invited you to view their records/)
  assert.match(notificationText('share_accepted'), /record sharing invitation/)
  assert.match(notificationText('share_declined'), /record sharing invitation/)
  assert.equal(notificationText('something_new'), 'sent you a notification')
})

test('refreshing the first page keeps older loaded pages and live rows, drops deleted ones', () => {
  const existing = [make('live', 0), make('a', 5), make('gone', 6), make('b', 10), make('old', 30)]
  const page = [make('a', 5), make('b', 10)]
  const merged = mergeFirstPage(existing, page, true)
  assert.deepEqual(merged.map((item) => item.id), ['live', 'a', 'b', 'old'])

  const complete = mergeFirstPage(existing, page, false)
  assert.deepEqual(complete.map((item) => item.id), ['live', 'a', 'b'])

  assert.deepEqual(mergeFirstPage(existing, [], false), [])
})

test('a live insert prepends once and bumps the unread count', () => {
  const state = withItems([make('a', 5)], 1)
  const inserted = notificationsReducer(state, { type: 'inserted', notification: make('new', 0) })
  assert.deepEqual(inserted.items.map((item) => item.id), ['new', 'a'])
  assert.equal(inserted.unreadCount, 2)

  const again = notificationsReducer(inserted, { type: 'inserted', notification: make('new', 0) })
  assert.equal(again, inserted)

  const alreadyRead = notificationsReducer(state, { type: 'inserted', notification: make('r', 0, '2026-10-15T12:00:00Z') })
  assert.equal(alreadyRead.unreadCount, 1)
})

test('marking one read is optimistic, idempotent and reversible', () => {
  const state = withItems([make('a', 1), make('b', 2)], 2)
  const started = notificationsReducer(state, { type: 'read_started', id: 'a', at: '2026-10-15T12:00:00Z' })
  assert.equal(started.unreadCount, 1)
  assert.equal(started.items[0].readAt, '2026-10-15T12:00:00Z')

  assert.equal(notificationsReducer(started, { type: 'read_started', id: 'a', at: '2026-10-15T12:01:00Z' }), started)

  const failed = notificationsReducer(started, { type: 'read_failed', id: 'a' })
  assert.equal(failed.unreadCount, 2)
  assert.equal(failed.items[0].readAt, null)
})

test('a realtime update from another tab syncs read state and the badge', () => {
  const state = withItems([make('a', 1), make('b', 2)], 2)
  const updated = notificationsReducer(state, { type: 'updated', notification: make('a', 1, '2026-10-15T12:00:00Z') })
  assert.equal(updated.items[0].readAt, '2026-10-15T12:00:00Z')
  assert.equal(updated.unreadCount, 1)

  const unknown = notificationsReducer(state, { type: 'updated', notification: make('zzz', 1, '2026-10-15T12:00:00Z') })
  assert.equal(unknown, state)
})

test('mark all read zeroes the badge and a failure restores only what it flipped', () => {
  const state = withItems([make('a', 1), make('b', 2, '2026-10-15T11:00:00Z'), make('c', 3)], 5)
  const started = notificationsReducer(state, { type: 'read_all_started', at: '2026-10-15T12:00:00Z' })
  assert.equal(started.unreadCount, 0)
  assert.ok(started.items.every((item) => item.readAt !== null))

  const failed = notificationsReducer(started, { type: 'read_all_failed' })
  assert.deepEqual(failed.items.map((item) => item.readAt === null), [true, false, true])
  assert.equal(failed.unreadCount, 2)
})

test('before accepts ISO timestamps at microsecond precision and rejects anything else', () => {
  assert.equal(readBefore(null), null)
  assert.equal(readBefore('2026-10-15T11:53:00.123456+00:00'), '2026-10-15T11:53:00.123456+00:00')
  assert.equal(readBefore('2026-10-15T11:53:00Z'), '2026-10-15T11:53:00Z')
  assert.throws(() => readBefore('yesterday'), /before must be an ISO 8601 timestamp/)
  assert.throws(() => readBefore('2026-13-45T99:99:00Z'), /before must be/)
  assert.throws(() => readBefore('2026-10-15'), /before must be/)
  assert.throws(() => readBefore(''), /before must be/)
})
