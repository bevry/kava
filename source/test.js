/* eslint no-console:0 */

// Import
const {spawn} = require('child_process')
const {join} = require('path')

// Prepare
const everythingTestPath = join(__dirname, 'examples', 'example1.js')
const expectedCount = '13/16 tests ran successfully'
const expectedError = 'deliberate error'

// Test Default Reporter
function defaultReporter (next) {
	let output = ''
	const runner = spawn('node', [everythingTestPath])
	runner.stdout.on('data', function (data) {
		output += data
		process.stdout.write(data)
	})
	runner.stderr.on('data', function (data) {
		output += data
		process.stderr.write(data)
	})
	runner.on('exit', function () {
		const fail = output.indexOf(expectedCount) === -1 || output.indexOf(expectedError) === -1
		if ( !fail ) {
			console.log('THE ABOVE -->IS<-- WHAT WE EXPECTED. TESTS HAVE PASSED')
		}
		else {
			console.error('THE ABOVE IS -->NOT<-- WHAT WE EXPECTED. TESTS HAVE FAILED')
			process.exit(1)
			return
		}

		next()
	})
}

// Test List Reporter
function listReporter (next) {
	let output = ''
	const runner = spawn('node', [everythingTestPath, '--joe-reporter=list'])
	runner.stdout.on('data', function (data) {
		output += data
		process.stdout.write(data)
	})
	runner.stderr.on('data', function (data) {
		output += data
		process.stderr.write(data)
	})
	runner.on('exit', function () {
		const fail = output.indexOf(expectedCount) === -1 || output.indexOf(expectedError) === -1
		if ( !fail ) {
			console.log('THE ABOVE -->IS<-- WHAT WE EXPECTED. TESTS HAVE PASSED')
		}
		else {
			console.error('THE ABOVE IS -->NOT<-- WHAT WE EXPECTED. TESTS HAVE FAILED')
			process.exit(1)
			return
		}

		next()
	})
}

// Run the tests
defaultReporter(function () {
	listReporter(function () {
		console.log('ALL DONE')
	})
})
