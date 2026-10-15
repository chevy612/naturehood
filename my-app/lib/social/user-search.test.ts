import assert from 'node:assert/strict'
import test from 'node:test'
import { usernameSearchPattern } from './user-search'

test('a username search wraps the term for a contains match', () => {
  assert.equal(usernameSearchPattern('chevy'), '%chevy%')
  assert.equal(usernameSearchPattern('  chevy  '), '%chevy%')
})

test('a leading @ is ignored', () => {
  assert.equal(usernameSearchPattern('@jamie'), '%jamie%')
  assert.equal(usernameSearchPattern('@@jamie'), '%jamie%')
})

test('LIKE wildcards typed by the user match literally', () => {
  assert.equal(usernameSearchPattern('justin_39'), '%justin\\_39%')
  assert.equal(usernameSearchPattern('100%'), '%100\\%%')
  assert.equal(usernameSearchPattern('a\\b'), '%a\\\\b%')
})

test('empty or @-only input is not searchable', () => {
  assert.equal(usernameSearchPattern(''), null)
  assert.equal(usernameSearchPattern('   '), null)
  assert.equal(usernameSearchPattern('@'), null)
  assert.equal(usernameSearchPattern('@ '), null)
})
