import { describe, expect, it } from 'vitest'
import {
  CORRUPT_BACKUP_KEY,
  createEmptyProgress,
  loadProgress,
  migrate,
  parseProgressJson,
  PROGRESS_STORAGE_KEY,
  progressToJson,
  saveProgress,
} from './storage'

const completed = {
  version: 1,
  lessons: { 'css-box-model': { completedAt: '2026-10-18T13:00:00.000Z' } },
} as const

describe('migrate (validation)', () => {
  it('accepts valid progress', () => {
    expect(migrate(completed)).toEqual(completed)
  })

  it('fills in a missing section as empty', () => {
    expect(migrate({ version: 1 })).toEqual(createEmptyProgress())
  })

  it('drops unknown extra fields', () => {
    expect(migrate({ ...completed, hacked: true })).toEqual(completed)
  })

  it.each([
    ['null', null],
    ['an array', []],
    ['a string', 'progress'],
    ['no version', { lessons: {} }],
    ['a newer version', { version: 2, lessons: {} }],
    ['lessons as an array', { version: 1, lessons: [] }],
    ['a lesson without completedAt', { version: 1, lessons: { a: {} } }],
    ['a non-string completedAt', { version: 1, lessons: { a: { completedAt: 5 } } }],
  ])('rejects %s', (_label, value) => {
    expect(migrate(value)).toBeNull()
  })
})

describe('localStorage', () => {
  it('starts empty on the first visit', () => {
    expect(loadProgress()).toEqual(createEmptyProgress())
  })

  it('loads what was saved', () => {
    saveProgress(completed)
    expect(loadProgress()).toEqual(completed)
  })

  it('starts fresh on corrupted data, and keeps a backup of it', () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, '{not json')
    expect(loadProgress()).toEqual(createEmptyProgress())
    expect(localStorage.getItem(CORRUPT_BACKUP_KEY)).toBe('{not json')
  })
})

describe('export / import JSON', () => {
  it('round-trips progress', () => {
    expect(parseProgressJson(progressToJson(completed))).toEqual(completed)
  })

  it('rejects invalid JSON and the wrong shape', () => {
    expect(parseProgressJson('{oops')).toBeNull()
    expect(parseProgressJson('{"name": "not progress"}')).toBeNull()
  })
})
