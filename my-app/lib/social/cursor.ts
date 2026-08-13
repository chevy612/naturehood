type DateCursor = {
  createdAt: string
  id: string
}

type FeedCursor = DateCursor & {
  score: number
}

type SearchCursor = DateCursor & {
  rank: number
}

function encode(value: object) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url')
}

function decode<T>(cursor: string): T {
  try {
    const value: unknown = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Malformed cursor')
    return value as T
  } catch {
    throw new Error('Invalid pagination cursor')
  }
}

function isDateCursor(value: DateCursor): value is DateCursor {
  return Boolean(value.id && value.createdAt && !Number.isNaN(Date.parse(value.createdAt)))
}

export function encodeDateCursor(cursor: DateCursor) {
  return encode(cursor)
}

export function decodeDateCursor(cursor: string): DateCursor {
  const value = decode<DateCursor>(cursor)
  if (!isDateCursor(value)) throw new Error('Invalid pagination cursor')
  return value
}

export function encodeFeedCursor(cursor: FeedCursor) {
  return encode(cursor)
}

export function decodeFeedCursor(cursor: string): FeedCursor {
  const value = decode<FeedCursor>(cursor)
  if (!isDateCursor(value) || !Number.isFinite(value.score)) throw new Error('Invalid pagination cursor')
  return value
}

export function encodeSearchCursor(cursor: SearchCursor) {
  return encode(cursor)
}

export function decodeSearchCursor(cursor: string): SearchCursor {
  const value = decode<SearchCursor>(cursor)
  if (!isDateCursor(value) || !Number.isFinite(value.rank)) throw new Error('Invalid pagination cursor')
  return value
}

