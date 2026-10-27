import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isNewer } from './version.ts'

describe('isNewer', () => {
  it('detects a bumped semver', () => {
    assert.equal(
      isNewer(
        { version: '0.2.0', build: 'aaa', builtAt: '' },
        { version: '0.1.0', build: 'bbb', builtAt: '' },
      ),
      true,
    )
  })

  it('detects a new build on the same version', () => {
    assert.equal(
      isNewer(
        { version: '0.2.0', build: 'fff1111', builtAt: '' },
        { version: '0.2.0', build: 'eee0000', builtAt: '' },
      ),
      true,
    )
  })

  it('ignores matching dev builds', () => {
    assert.equal(
      isNewer(
        { version: '0.2.0', build: 'dev', builtAt: '' },
        { version: '0.2.0', build: 'dev', builtAt: '' },
      ),
      false,
    )
  })
})
