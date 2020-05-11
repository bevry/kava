'use strict'

// Import
const assert = require('assert-helpers')
const kava = require('../index.js')

// Tests
kava.suite('freeze example', function (suite, test) {
	test('api is readonly within node', function () {
		// Only run if our environment supports this
		if (typeof window === 'undefined') {
			// Attempt modification
			try {
				kava.blah = "was set when it shouldn't have been"
			} catch (err) {
				// https://travis-ci.org/bevry/kava/jobs/135251737
			}

			// Test that the modifications were not successful
			assert.equal(
				kava.blah == null,
				true,
				'modification test, result: ' + kava.blah
			)
		}
	})
})
