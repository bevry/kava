/* eslint no-console:0 */

// Import
const joe = require('../')

// Our test
joe.suite('example2', function (suite, test) {
	test('first test', function (complete) {
		setTimeout(function () {
			console.log('this will be outputted second')
			complete()
		}, 1000)
	})

	test('second test', function () {
		console.log('this will be outputted third')
	})

	console.log('this will be outputted first')
})
