// Import
const joe = require('../')

// Test
joe.suite('deliberate throw suite', function () {
	throw new Error('I am the deliberate throw')
})
