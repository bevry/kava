/* eslint no-console:0, no-implicit-coercion:0 */
'use strict'

// Import
const assert = require('assert-helpers')
const kava = require('../index.js')

// Prepare
const delay = 1000 // anything less than 1s causes issues on high-stressed machines
function wait(delay, fn) {
	return setTimeout(fn, delay)
}

// Tests
kava.suite('standard example', function (suite, test) {
	suite('tests', function (suite, test) {
		suite('async-tests', function (suite, test) {
			const checks = []

			test('1/2', function (done) {
				wait(1 * delay, function () {
					checks.push(1)
					assert.deepEqual(checks, [1])
					done()
				})
			})

			test('2/2', function (done) {
				wait(2 * delay, function () {
					checks.push(2)
					assert.deepEqual(checks, [1, 2])
					done()
				})
			})
		})

		suite('sync', function (suite, test) {
			const checks = []
			test('1/2', function () {
				checks.push(1)
				assert.deepEqual(checks, [1])
			})

			test('2/2', function () {
				checks.push(2)
				assert.deepEqual(checks, [1, 2])
			})
		})

		suite('async-sync', function (suite, test) {
			const checks = []

			test('1/2', function (done) {
				wait(1 * delay, function () {
					checks.push(1)
					assert.deepEqual(checks, [1])
					done()
				})
			})

			test('2/2', function () {
				checks.push(2)
				assert.deepEqual(checks, [1, 2])
			})
		})

		suite('async-suite', function (suite, test, done) {
			const checks = []

			wait(1 * delay, function () {
				test('1/2', function () {
					checks.push(1)
				})
			})

			wait(2 * delay, function () {
				test('2/2', function () {
					checks.push(2)
				})
			})

			wait(3 * delay, function () {
				checks.push(3)
				done()
			})

			wait(4 * delay, function () {
				checks.push(4)
				assert.deepEqual(checks, [3, 1, 2, 4])
			})
		})

		suite('before and after', function (suite, test) {
			const checks = []

			this.on('test.before', function (test, complete) {
				checks.push('before - ' + test.config.name + ' - part 1')
				wait(100, function () {
					checks.push('before - ' + test.config.name + ' - part 2')
					complete()
				})
			})

			this.on('test.after', function (test, complete) {
				checks.push('after - ' + test.config.name + ' - part 1')
				wait(100, function () {
					checks.push('after - ' + test.config.name + ' - part 2')
					complete()
				})
			})

			test('test 1', function () {
				checks.push('test 1')
				assert.deepEqual(checks, [
					'before - test 1 - part 1',
					'before - test 1 - part 2',
					'test 1',
				])
			})

			test('test 2', function () {
				checks.push('test 2')
				assert.deepEqual(checks, [
					'before - test 1 - part 1',
					'before - test 1 - part 2',
					'test 1',
					'after - test 1 - part 1',
					'after - test 1 - part 2',
					'before - test 2 - part 1',
					'before - test 2 - part 2',
					'test 2',
				])
			})

			function before(complete) {
				const test = this
				checks.push('only before - ' + test.config.name + ' - part 1')
				wait(100, function () {
					checks.push('only before - ' + test.config.name + ' - part 2')
					complete()
				})
			}

			function after(complete) {
				const test = this
				checks.push('only after - ' + test.config.name + ' - part 1')
				wait(100, function () {
					checks.push('only after - ' + test.config.name + ' - part 2')
					complete()
				})
			}

			test('test 3', { before, after }, function () {
				checks.push('test 3')
				assert.deepEqual(
					checks,
					[
						'before - test 1 - part 1',
						'before - test 1 - part 2',
						'test 1',
						'after - test 1 - part 1',
						'after - test 1 - part 2',
						'before - test 2 - part 1',
						'before - test 2 - part 2',
						'test 2',
						'after - test 2 - part 1',
						'after - test 2 - part 2',
						'only before - test 3 - part 1',
						'only before - test 3 - part 2',
						'before - test 3 - part 1',
						'before - test 3 - part 2',
						'test 3',
					],
					'test 3 checks',
				)
			})

			test('test 4', function () {
				checks.push('test 4')
				assert.deepEqual(
					checks,
					[
						'before - test 1 - part 1',
						'before - test 1 - part 2',
						'test 1',
						'after - test 1 - part 1',
						'after - test 1 - part 2',
						'before - test 2 - part 1',
						'before - test 2 - part 2',
						'test 2',
						'after - test 2 - part 1',
						'after - test 2 - part 2',
						'only before - test 3 - part 1',
						'only before - test 3 - part 2',
						'before - test 3 - part 1',
						'before - test 3 - part 2',
						'test 3',
						'only after - test 3 - part 1',
						'only after - test 3 - part 2',
						'after - test 3 - part 1',
						'after - test 3 - part 2',
						'before - test 4 - part 1',
						'before - test 4 - part 2',
						'test 4',
					],
					'test 4 checks',
				)
			})
		})

		suite('deliberate-suite-failure ignored', function (suite, test) {
			this.setConfig({ abortOnError: false })
			throw new Error('deliberate error suite')
			// @TODO this will be ignored the error list output, as abortOnError suppresses the error of the item it is applied for
			// this is likely a taskgroup thing, perhaps state.error is still recorded, if so we can use that
			// can be looked into at a later stage, as this isn't ideal, however the suite is still reported as failed
			// and this is a very rare thing to occur, so no urgency is required
		})

		suite('deliberate-test-failure ignored', function (suite, test) {
			const err1 = new Error('deliberate error 1')
			const err2 = new Error('deliberate error 2')

			this.setConfig({ abortOnError: false })

			test('1/2', function () {
				throw err1
			})

			test('2/2', function (done) {
				return done(err2)
			})

			this.done(function (err, result) {
				assert.errorEqual(err, null)
				assert.deepEqual(result, [[err1], [err2]])
			})
		})

		suite('deliberate-test-failure', function (suite, test) {
			/* eslint no-unused-vars:0 */
			test('1/2', function (done) {
				wait(1 * delay, function () {
					throw new Error('deliberate error') // this will nuke the browser as it can't catch async errors
					// done() <-- never reached intentionally
				})
			})

			test('2/2', function () {
				// should never be reached
				throw new Error('unexpected error')
			})
		})
	})
})
