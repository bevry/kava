/* eslint no-use-before-define:0, no-console:0, class-methods-use-this:0 */
'use strict'

// Import
const EventEmitterGrouped = require('event-emitter-grouped')
const { Task, TaskGroup } = require('taskgroup')

// =================================
// Generic

function setConfig () {
	const { before, after } = this.config
	if (before) {
		delete this.config.before
		this.on('before', before)
	}
	if (after) {
		delete this.config.after
		this.on('after', after)
	}
	return this
}

function run (next, ...args) {
	if (!this.started) {
		this.emitSerial('before', (err) => {
			if (err) this.emit('error', err)
			next.apply(this, args)
		})
	}
	else {
		next.apply(this, args)
	}
	return this
}

function finish (next, ...args) {
	if (!this.exited) {
		this.emitSerial('after', (err) => {
			if (err) this.emit('error', err)
			next.apply(this, args)
		})
	}
	else {
		next.apply(this, args)
	}
	return this
}

// =================================
// Test

class Test extends Task {
	static create (...args) {
		return new this(...args)
	}

	static isTest (test) {
		return test instanceof Test
	}

	setConfig (...args) {
		super.setConfig(...args)
		return setConfig.call(this)
	}

	run (...args) {
		return run.call(this, super.run, args)
	}

	finish (...args) {
		return finish.call(this, super.finish, args)
	}
}


// =================================
// Suite

class Suite extends TaskGroup {
	static create (...args) {
		return new this(...args)
	}

	static isSuite (suite) {
		return suite instanceof Suite
	}

	setConfig (...args) {
		super.setConfig(...args)
		return setConfig.call(this)
	}

	run (...args) {
		return run.call(this, super.run, ...args)
	}

	finish (...args) {
		return finish.call(this, super.finish, ...args)
	}

	suite (...args) {
		const suite = new Suite(...args)
		return this.addTaskGroup(suite)
	}

	describe (...args) {
		return this.suite(...args)
	}

	test (...args) {
		const test = new Test(...args)
		return this.addTask(test)
	}

	it (...args) {
		return this.test(...args)
	}

	constructor (...args) {
		super(...args)
		const me = this

		// Shallow Listeners
		this.on('item.add', function (item) {
			if (Test.isTest(item)) {
				item.on('running', function () {
					me.testRunCallback(item)
				})
				item.done(function (err) {
					me.testCompleteCallback(item, err)
				})
				item.on('before', function (complete) {
					me.emitSerial('test.before', this, complete)
				})
				item.on('after', function (complete) {
					me.emitSerial('test.after', this, complete)
				})
			}

			else if (Suite.isSuite(item)) {
				item.on('running', function () {
					me.suiteRunCallback(item)
				})
				item.done(function (err) {
					me.suiteCompleteCallback(item, err)
				})
				item.on('before', function (complete) {
					me.emitSerial('suite.before', this, complete)
				})
				item.on('after', function (complete) {
					me.emitSerial('suite.after', this, complete)
				})
			}

			// Add nested listener
			// nestedListener(item)
		})

		// Chain
		return this
	}

	addMethod (method, config = {}) {
		if (config.reporting == null) config.reporting = false
		if (config.name == null) config.name = `suite initializer for ${this.name}`
		if (config.args == null) config.args = [this.suite.bind(this), this.test.bind(this)]
		return super.addMethod(method, config)
	}


	// =================================
	// Callbacks

	suiteRunCallback (suite) {
		const report = suite.config.reporting !== false

		if (report) {
			++Private.totalSuites
			Public.report('startSuite', suite)
		}
	}

	suiteCompleteCallback (suite, err) {
		const report = suite.config.reporting !== false

		if (err) {
			Private.addErrorLog({ suite, err })
			if (report) {
				++Private.totalFailedSuites
			}
		}
		else if (report) {
			++Private.totalPassedSuites
		}

		if (err || report) {
			Public.report('finishSuite', suite, err)
		}
	}

	testRunCallback (test) {
		const report = test.config.reporting !== false

		if (report) {
			++Private.totalTests
			Public.report('startTest', test)
		}
	}

	testCompleteCallback (test, err) {
		const report = test.config.reporting !== false

		if (err) {
			Private.addErrorLog({ test, err })
			if (report) {
				++Private.totalFailedTests
			}
		}
		else if (report) {
			++Private.totalPassedTests
		}

		if (err || report) {
			Public.report('finishTest', test, err)
		}
	}
}

// =================================
// Event Emitter Grouped

// Add event emitter grouped to our classes
Object.getOwnPropertyNames(EventEmitterGrouped.prototype).forEach(function (key) {
	Test.prototype[key] = Suite.prototype[key] = EventEmitterGrouped.prototype[key]
})


// =================================
// Private Interface

// Creare out private interface
// The reason we have a public and private interface is that we do not want tests being able to modify the test results
// As such, the private interface contains properties that must be mutable by the public interface, but not mutable by the bad tests
const Private = {

	// Global Suite
	// We use a global suite to contain all of the Suite suites and tests
	globalSuite: null,

	// Get Global Suite
	// We have a getter for the global suite to create it when it is actually needed
	getGlobalSuite () {
		// If it doesn't exist, then create it and name it kava
		if (Private.globalSuite == null) {
			Private.globalSuite = new Suite({
				reporting: false,
				name: 'global kava suite'
			}).run()
		}

		// Return the global suite
		return Private.globalSuite
	},

	// Error Logs
	// We log all the errors that have occured with their suite and test
	// so the reporters can access them
	errorLogs: [], // [{err, suite, test, name}]

	// Add Error Log
	// Logs an error into the errors array, however only if we haven't already logged it
	// log = {err,suite,test,name}
	addErrorLog (errorLog) {
		const lastLog = Private.errorLogs[Private.errorLogs.length - 1]
		if (errorLog.err === (lastLog && lastLog.err)) {
			// ignore
		}
		else {
			Private.errorLogs.push(errorLog)
		}
		return Private
	},

	// Exited?
	// Whether or not we have already exited, either via error or via finishing everything it is meant to be doing
	// We store this flag, as we do not want to exit multiple times if we have multiple errors or exit signals
	exited: false,

	// Reports
	// This is a listing of all the reporters we will be using
	// Reporters are what output the results of our tests/suites to the user (we just run them)
	reporters: [],

	// Totals
	// Here are a bunch of totals we use to calculate our progress
	// They are mostly used by reporters, however we do use them to figure out if we were successful or not
	totalSuites: 0,
	totalPassedSuites: 0,
	totalFailedSuites: 0,
	totalTests: 0,
	totalPassedTests: 0,
	totalFailedTests: 0,

	// Get Reporters
	// If no reporters have been set, attempt to load reporters
	// Reporters will be loaded in order of descending preference
	// the `--kava-reporter=value` command line arguments
	// the `KAVA_REPORTER` environment variable
	getReporters () {
		// Check if have no reporters
		if (Private.reporters.length === 0) {
			// Prepare
			const reporters = []

			// Cycle through our CLI arguments
			// looking for --kava-reporter=REPORTER
			if (process && process.argv) {
				const args = process.argv
				for (let i = 0; i < args.length; ++i) {
					const arg = args[i]
					const reporter = arg.replace(/^--kava-reporter=/, '')
					if (reporter === arg) continue
					reporters.push(reporter)
				}
			}

			// If the CLI arguments returned no reporters
			// then attempt the environment variable
			if (reporters.length === 0) {
				if (process && process.env && process.env.KAVA_REPORTER) {
					reporters.push(process.env.KAVA_REPORTER)
				}
				else {
					reporters.push('console')
				}
			}

			// Attempt to load each reporter
			for (let index = 0; index < reporters.length; index++) {
				const value = reporters[index]
				Public.addReporter(value)
			}
		}

		// Return our reporters
		return Private.reporters
	}
}


// =================================
// Public Interface

// Create the interface for Kava
const Public = {
	// Get Totals
	// Fetches all the different types of totals we have collected
	// and determines the incomplete suites and tasks
	// as well as whether or not everything has succeeded correctly (no incomplete, no failures, no errors)
	getTotals () {
		// Fetch
		const { totalSuites, totalPassedSuites, totalFailedSuites, totalTests, totalPassedTests, totalFailedTests, errorLogs } = Private

		// Calculate
		const totalIncompleteSuites = totalSuites - totalPassedSuites - totalFailedSuites
		const totalIncompleteTests = totalTests - totalPassedTests - totalFailedTests
		const totalErrors = errorLogs.length
		const success =
			(totalIncompleteSuites === 0) &&
			(totalFailedSuites === 0) &&
			(totalIncompleteTests === 0) &&
			(totalFailedTests === 0) &&
			(totalErrors === 0)

		// Return
		const result = {
			totalSuites,
			totalPassedSuites,
			totalFailedSuites,
			totalIncompleteSuites,
			totalTests,
			totalPassedTests,
			totalFailedTests,
			totalIncompleteTests,
			totalErrors,
			success
		}

		return result
	},

	// Get Errors
	// Returns a cloned array of all the error logs
	getErrorLogs () {
		return Private.errorLogs.slice()
	},

	// Has Errors
	// Returns false if there were no incomplete, no failures and no errors
	hasErrors () {
		return this.getTotals().success === false
	},

	// Has Exited
	// Returns true if we have exited already
	// we do not want to exit multiple times
	hasExited () {
		return Private.exited === true
	},

	// Has Reportes
	// Do we have any reporters yet?
	hasReporters () {
		return Array.isArray(Private.reporters) && Private.reporters.length !== 0
	},

	// Add Reporter
	// Add a reporter to the list of reporters we will be using
	addReporter (nameOrPath, config = {}) {
		// Match
		let path
		switch (nameOrPath) {
			case 'console':
			case 'kava-reporter-console':
				path = './reporters/console/index.js'
				break
			case 'list':
			case 'kava-reporter-list':
				path = './reporters/console/list.js'
				break
			default:
				path = nameOrPath
		}

		// Load
		const Reporter = require(path)

		// Instantiate
		config.kava = this
		const reporter = new Reporter(config)

		// Add the reporter to the list of reporters we have
		Private.reporters.push(reporter)

		// Chain
		return this
	},

	// Set Reporter
	// Clear all the other reporters we may be using, and just use this one
	setReporter (reporter) {
		Private.reporters = []
		if (reporter) {
			this.addReporter(reporter)
		}

		// Chain
		return this
	},

	// Report
	// Report and event to our reporters
	report (event, ...args) {
		// Fetch the reporters
		const reporters = Private.getReporters()

		// Check we have reporters
		if (reporters.length === 0) {
			console.error('kava has no reporters to log:', event, ...args)
			this.exit(1)
			return this
		}

		// For each reporter that we have
		// Trigger the event handler if it exists for it
		for (let i = 0; i < reporters.length; ++i) {
			const reporter = reporters[i]
			if (reporter[event]) reporter[event](...args)
		}

		// Chain
		return this
	},

	// Exit
	// Exit our process with the specifeid exitCode
	// If no exitCode is set, then we determine it through the hasErrors call
	exit (exitCode = 0, reason) {
		// Check
		if (this.hasExited()) return
		Private.exited = true

		// Determine exit code
		if (!exitCode) {
			exitCode = this.hasErrors() ? 1 : 0
		}

		// Stop running more tests if we have begun
		const suite = Private.getGlobalSuite()
		if (suite) suite.destroy()

		// Report our exit
		this.report('exit', exitCode, reason)

		// Kill our process with the correct exit code
		if (process && process.exit) {
			process.exit(exitCode)
		}

		// Chain
		return this
	}
}


// =================================
// Interface

// Create our public interface for creating suites and tests
Public.describe = Public.suite = function suite (...args) {
	return Private.getGlobalSuite().suite(...args)
}
Public.it = Public.test = function test (...args) {
	return Private.getGlobalSuite().test(...args)
}

// Freeze our public interface from changes
if (Object.freeze) {
	Object.freeze(Public)
}


// =================================
// Events

// On node systems, wait until the process exits
// such that errors that occur outside of the tests can be caught before we shut down
if (process) {
	process.on('beforeExit', function () {
		Public.exit(0, 'beforeExit')
	})

	process.on('exit', function () {
		Public.exit(0, 'exit')
	})

	// Have last, as this way it won't silence errors that may have occured earlier
	process.on('uncaughtException', function (err) {
		if (!err) err = new Error('uncaughtException was emitted without an error')
		Private.addErrorLog({ err, name: 'uncaughtException' })
		Public.exit(1, 'uncaughtException')
	})
}

// On browser systems, wait until the tests have finished
else {
	Private.getGlobalSuite().on('destroyed', function () {
		Public.exit(0, 'destroyed')
	})
}


// =================================
// Export

module.exports = Public
