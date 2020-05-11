'use strict'

// Import
const kava = require('../index.js')

// Test
kava.suite('fail invalid suite example', function () {
	throw new Error(
		'I should NOT OCCUR, as the suite should have already failed, due the lack of arguments'
	)
})
