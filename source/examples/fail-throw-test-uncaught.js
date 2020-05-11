'use strict'

// Import
const kava = require('../index.js')

// Test
kava.suite('fail throw test uncaught example', function (suite, test) {
	test('throw after timeout', function () {
		setTimeout(function () {
			throw new Error(
				'I am the deliberate throw that occured in the test, but after the test has completed'
			)
		}, 10)
	})
})
