import { withDependency } from './spans'

type RpcError = { message: string; code?: string } | null
type RpcResult<T> = { data: T; error: RpcError }

type RpcClient = {
  rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<RpcResult<unknown>>
}

function rpcErrorCode(error: RpcError): string | undefined {
  if (!error) return undefined
  if (error.code && /^[A-Za-z0-9_]{2,32}$/.test(error.code)) return error.code
  return 'rpc_error'
}

export function tracedRpc<T = unknown>(
  client: RpcClient,
  fn: string,
  args?: Record<string, unknown>,
): Promise<RpcResult<T>> {
  return withDependency(
    `supabase.rpc ${fn}`,
    { 'db.system': 'supabase', 'db.operation': fn },
    () => client.rpc(fn, args) as Promise<RpcResult<T>>,
    (result) => rpcErrorCode(result.error),
  )
}

type EmailError = { message?: string; name?: string } | null

export function tracedEmailSend<T extends { error: EmailError }>(
  send: () => Promise<T>,
): Promise<T> {
  return withDependency(
    'email.send',
    { 'email.provider': 'resend' },
    send,
    (result) => (result.error ? 'email_error' : undefined),
  )
}

type StorageError = { message?: string } | null

export function tracedStorageUpload(
  upload: () => Promise<{ error: StorageError }>,
  bucket: string,
): Promise<{ error: StorageError }> {
  return withDependency(
    'supabase.storage.upload',
    { 'db.system': 'supabase', 'storage.bucket': bucket, 'storage.operation': 'upload' },
    upload,
    (result) => (result.error ? 'storage_error' : undefined),
  )
}

export function tracedPushSend<T extends { status: string }>(
  send: () => Promise<T[]>,
  destinationCount: number,
): Promise<T[]> {
  return withDependency(
    'push.send',
    { 'messaging.system': 'expo', 'messaging.destination_count': destinationCount },
    send,
    (tickets) => (tickets.some((ticket) => ticket.status === 'error') ? 'push_ticket_error' : undefined),
  )
}
