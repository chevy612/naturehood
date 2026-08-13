import { NextResponse } from 'next/server'

export type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: string | null
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data, error: null },
    init
  )
}

export function failure(error: string, status: number) {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, data: null, error },
    { status }
  )
}

export type FeedResponse<T> = {
  data: T[]
  nextCursor: string | null
  hasNext: boolean
}

export function feedResponse<T>(data: T[], nextCursor: string | null): FeedResponse<T> {
  return { data, nextCursor, hasNext: nextCursor !== null }
}

