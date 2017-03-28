'use strict'

// Import
const {spawn} = require('child_process')
const {equal} = require('assert-helpers')
const {Task, TaskGroup} = require('taskgroup')

// Create a seperator
function sep (length, sep) {
	let str = ''
	for ( let i = 0; i < length; ++i ) {
		str += sep
	}
	return str
}

// Run a single test
function test (opts) {
	const {expected, script, reporter} = opts
	return new Task(function (complete) {
		// Prepare
		const expectedCleaned = expected.trim()

		// Test Reporter
		let output = ''
		const args = [script, `--joe-reporter=${reporter}`, '--no-colors']
		const str = args.join(' ')
		process.stdout.write(sep(str.length, '=') + '\n' + str + '\n\n')
		const runner = spawn('node', args, {env: process.env})
		runner.stdout.on('data', function (data) {
			output += data
			process.stdout.write(data)
		})
		runner.stderr.on('data', function (data) {
			output += data
			process.stderr.write(data)
		})
		runner.once('close', function () {
			output = output.replace(/[\n\s]+at .+/g, '').replace(/^\s|\s$/g, '')
			try {
				equal(output.trim(), expectedCleaned.trim())
			}
			catch ( err ) {
				return complete(err)
			}
			process.stdout.write('\n^^ the above was as expected ^^\n')
			return complete()
		})
	})
}

// Run multiple tests
function tests (opts, list) {
	return new TaskGroup({
		tasks: list.map(function (item) {
			Object.keys(opts).forEach(function (key) {
				item[key] = opts[key]
			})
			return test(item)
		})
	}).done(function (err) {
		if ( err ) {
			/* eslint no-console:0 */
			console.error(err.stack || err.message || err)
			process.exit(1)
		}
	}).run()
}

// Export
module.exports = {test, tests}
