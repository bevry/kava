// Import
const joe = require('../')

// Test
joe.suite('deliberate throw suite', function (suite, test) {
	test('deliberate throw test', function () {
		setTimeout(function () {
			throw new Error('I am the deliberate throw')
		}, 10)
	})
})
