/* eslint no-console:0 */

// @TODO add suite.before, and suite.after examples
// @TODO add nested.task.before, nested.task.after, nested.suite.before, nested.suite.after examples

// Import
const {equal, deepEqual, errorEqual} = require('assert-helpers')
const joe = require('../')

// Prepare
function wait (delay, fn) {
	return setTimeout(fn, delay)
}

// Tests
joe.suite('example1', function (suite, test) {

	test('api is readonly within node', function () {
		// Only run if our environment supports this
		if ( typeof window === 'undefined' ) {
			// Attempt modification
			joe.blah = "was set when it shouldn't have been"

			// Test that the modifications were not successful
			equal(joe.blah == null, true, `modification test, result: ${joe.blah}`)
		}
	})

	suite('tests', function (suite) {

		suite('async-tests', function (suite, test) {
			const checks = []

			test('1/2', function (done) {
				wait(1 * 1000, function () {
					checks.push(1)
					deepEqual(checks, [1])
					done()
				})
			})

			test('2/2', function (done) {
				wait(2 * 1000, function () {
					checks.push(2)
					deepEqual(checks, [1, 2])
					done()
				})
			})
		})

		suite('sync', function (suite, test) {
			const checks = []
			test('1/2', function () {
				checks.push(1)
				deepEqual(checks, [1])
			})

			test('2/2', function () {
				checks.push(2)
				deepEqual(checks, [1, 2])
			})
		})

		suite('async-sync', function (suite, test) {
			const checks = []

			test('1/2', function (done) {
				wait(1 * 1000, function () {
					checks.push(1)
					deepEqual(checks, [1])
					done()
				})
			})

			test('2/2', function () {
				checks.push(2)
				deepEqual(checks, [1, 2])
			})
		})

		suite('async-suite', function (suite, test, done) {
			const checks = []

			wait(1 * 1000, function () {
				test('1/2', function () {
					checks.push(1)
				})
			})

			wait(2 * 1000, function () {
				test('2/2', function () {
					checks.push(2)
				})
			})

			wait(3 * 1000, function () {
				checks.push(3)
				done()
			})

			wait(4 * 1000, function () {
				checks.push(4)
				deepEqual(checks, [3, 1, 2, 4])
			})
		})

		suite('before and after', function (suite, test) {
			const checks = []

			this.on('test.before', function (test, complete) {
				checks.push(`before - ${test.config.name} - part 1`)
				wait(100, function () {
					checks.push(`before - ${test.config.name} - part 2`)
					complete()
				})
			})

			this.on('test.after', function (test, complete) {
				checks.push(`after - ${test.config.name} - part 1`)
				wait(100, function () {
					checks.push(`after - ${test.config.name} - part 2`)
					complete()
				})
			})

			test('test 1', function () {
				checks.push('test 1')
				deepEqual(checks, [
					'before - test 1 - part 1',
					'before - test 1 - part 2',
					'test 1'
				])
			})

			test('test 2', function () {
				checks.push('test 2')
				deepEqual(checks, [
					'before - test 1 - part 1',
					'before - test 1 - part 2',
					'test 1',
					'after - test 1 - part 1',
					'after - test 1 - part 2',
					'before - test 2 - part 1',
					'before - test 2 - part 2',
					'test 2'
				])
			})

			function before (test, complete) {
				checks.push(`only before - ${test.config.name} - part 1`)
				wait(100, function () {
					checks.push(`only before - ${test.config.name} - part 2`)
					complete()
				})
			}

			function after (test, complete) {
				checks.push(`only after - ${test.config.name} - part 1`)
				wait(100, function () {
					checks.push(`only after - ${test.config.name} - part 2`)
					complete()
				})
			}

			test('test 3', {before, after}, function () {
				checks.push('test 3')
				deepEqual(checks, [
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
					'test 3'
				], 'test 3 checks')
			})

			test('test 4', function () {
				checks.push('test 4')
				deepEqual(checks, [
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
					'test 4'
				], 'test 4 checks')
			})
		})

		suite('deliberate-failure ignored', function (suite, test) {
			const err1 = new Error('deliberate error 1')
			const err2 = new Error('deliberate error 2')

			this.setConfig({abortOnError: false})

			test('1/2', function () {
				throw err1
			})

			test('2/2', function (done) {
				return done(err2)
			})

			this.done(function (err, result) {
				errorEqual(err, null)
				deepEqual(result, [[err1], [err2]])
			})
		})

		suite('deliberate-failure', function (suite, test) {
			/* eslint no-unused-vars:0 */
			test('1/2', function (done) {
				wait(1 * 1000, function () {
					throw new Error('deliberate error')  // this will nuke the browser as it can't catch async errors
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
