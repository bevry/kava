'use strict'

// Import
const kava = require('../index.js')

// Test
kava.suite('fail throw test uncaught example', function (suite, test) {
	test('throw after timeout', function () {
		setTimeout(function () {
			throw new Error(
				'I am the deliberate throw that occurred in the test, but after the test has completed'
			)
		}, 1000) // anything less than 1s causes issues on high-stressed machines
	})
})
