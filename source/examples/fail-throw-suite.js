'use strict'

// Import
const kava = require('../index.js')

// Test
kava.suite('fail throw suite example', function(suite, test) {
	throw new Error('I am the deliberate throw that occured during the suite')
})
