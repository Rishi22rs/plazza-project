import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldRequestLocationOnStartup, toPermissionState } from '../src/permissions/permissionState.ts';

// Pure domain tests run without an emulator. Native dialogs still need Android QA.
test('granted permission remains granted even if another request is disallowed', () => {
  assert.equal(toPermissionState({ granted: true, canAskAgain: false, status: 'granted' }), 'granted');
});
test('an ordinary denial is retryable, not permanently blocked', () => {
  assert.equal(toPermissionState({ granted: false, canAskAgain: true, status: 'denied' }), 'denied');
});
test('a denial that cannot be requested again requires Settings', () => {
  assert.equal(toPermissionState({ granted: false, canAskAgain: false, status: 'denied' }), 'blocked');
});
test('first-launch permission is distinguished from a previous denial', () => {
  assert.equal(toPermissionState({ granted: false, canAskAgain: true, status: 'undetermined' }), 'undetermined');
});

test('startup requests location for a fresh install or retryable denial', () => {
  assert.equal(shouldRequestLocationOnStartup('undetermined'), true);
  assert.equal(shouldRequestLocationOnStartup('denied'), true);
});

test('startup never requests granted, blocked, unsupported or failed permissions', () => {
  for (const state of ['granted', 'blocked', 'unavailable', 'error', 'checking']) {
    assert.equal(shouldRequestLocationOnStartup(state), false);
  }
});
