'use strict'

const kava = require('../index.js')

kava.suite('myfirstpackage', function(suite, test) {
	suite('a group of tests', function(suite, test) {
		test('an individual test', function() {
			/* the testing logic for this test would go here */
		})
	})
})
