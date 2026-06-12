import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ageInYears,
  calculPointByCelebrity,
  deathYear,
} from '../dist/index.js';

const d = (s) => new Date(s); // ISO strings parse as UTC midnight

test('ageInYears counts full years (birthday not yet reached)', () => {
  assert.equal(ageInYears(d('1960-06-15'), d('2020-06-14')), 59);
  assert.equal(ageInYears(d('1960-06-15'), d('2020-06-15')), 60);
  assert.equal(ageInYears(d('1960-06-15'), d('2020-06-16')), 60);
});

test('calculPointByCelebrity buckets by age', () => {
  assert.equal(calculPointByCelebrity(d('1930-01-01'), d('2020-06-01')), 1); // 90
  assert.equal(calculPointByCelebrity(d('1940-01-01'), d('2020-06-01')), 2); // 80
  assert.equal(calculPointByCelebrity(d('1950-01-01'), d('2020-06-01')), 3); // 70
  assert.equal(calculPointByCelebrity(d('1960-01-01'), d('2020-06-01')), 4); // 60
  assert.equal(calculPointByCelebrity(d('1980-01-01'), d('2020-06-01')), 5); // 40
});

test('bucket boundaries are inclusive at the lower edge', () => {
  assert.equal(calculPointByCelebrity(d('1935-01-01'), d('2020-01-01')), 1); // exactly 85
  assert.equal(calculPointByCelebrity(d('1955-01-01'), d('2020-01-01')), 3); // exactly 65
  assert.equal(calculPointByCelebrity(d('1965-01-01'), d('2020-01-01')), 4); // exactly 55
  assert.equal(calculPointByCelebrity(d('1965-06-01'), d('2020-01-01')), 5); // 54 -> youngest bucket
});

test('deathYear is UTC-stable (no off-by-one near midnight)', () => {
  assert.equal(deathYear(d('2026-01-01')), 2026);
  assert.equal(deathYear(d('2025-12-31')), 2025);
});
