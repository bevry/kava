/* eslint no-use-before-define:0, no-console:0, class-methods-use-this:0 */
'use strict'

// Import
const EventEmitterGrouped = require('event-emitter-grouped')
const {Task, TaskGroup} = require('taskgroup')

// =================================
// Generic

function setConfig () {
	const {before, after} = this.config
	if ( before ) {
		delete this.config.before
		this.on('before', before)
	}
	if ( after ) {
		delete this.config.after
		this.on('after', after)
	}
	return this
}

function run (next, ...args) {
	if ( !this.started ) {
		this.emitSerial('before', (err) => {
			if ( err )  this.emit('error', err)
			next.apply(this, args)
		})
	}
	else {
		next.apply(this, args)
	}
	return this
}

function finish (next, ...args) {
	if ( !this.exited ) {
		this.emitSerial('after', (err) => {
			if ( err )  this.emit('error', err)
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
			if ( Test.isTest(item) ) {
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

			else if ( Suite.isSuite(item) ) {
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
		if ( config.reporting == null )  config.reporting = false
		if ( config.name == null )  config.name = `suite initializer for ${this.name}`
		if ( config.args == null )  config.args = [this.suite.bind(this), this.test.bind(this)]
		return super.addMethod(method, config)
	}


	// =================================
	// Callbacks

	suiteRunCallback (suite) {
		const report = suite.config.reporting !== false

		if ( report ) {
			++joePrivate.totalSuites
			joe.report('startSuite', suite)
		}
	}

	suiteCompleteCallback (suite, err) {
		const report = suite.config.reporting !== false

		if ( err ) {
			joePrivate.addErrorLog({suite, err})
			if ( report ) {
				++joePrivate.totalFailedSuites
			}
		}
		else if ( report ) {
			++joePrivate.totalPassedSuites
		}

		if ( err || report ) {
			joe.report('finishSuite', suite, err)
		}
	}

	testRunCallback (test) {
		const report = test.config.reporting !== false

		if ( report ) {
			++joePrivate.totalTests
			joe.report('startTest', test)
		}
	}

	testCompleteCallback (test, err) {
		const report = test.config.reporting !== false

		if ( err ) {
			joePrivate.addErrorLog({test, err})
			if ( report ) {
				++joePrivate.totalFailedTests
			}
		}
		else if ( report ) {
			++joePrivate.totalPassedTests
		}

		if ( err || report ) {
			joe.report('finishTest', test, err)
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

// Creare out private interface for Joe
// The reason we have a public and private interface for joe is that we do not want tests being able to modify the test results
// As such, the private interface contains properties that must be mutable by the public interface, but not mutable by the bad tests
const joePrivate = {

	// Global Suite
	// We use a global suite to contain all of the Suite suites and joe.test tests
	globalSuite: null,

	// Get Global Suite
	// We have a getter for the global suite to create it when it is actually needed
	getGlobalSuite () {
		// If it doesn't exist, then create it and name it joe
		if ( joePrivate.globalSuite == null ) {
			joePrivate.globalSuite = new Suite({
				reporting: false,
				name: 'global joe suite'
			}).run()
		}

		// Return the global suite
		return joePrivate.globalSuite
	},

	// Error Logs
	// We log all the errors that have occured with their suite and test
	// so the reporters can access them
	errorLogs: [], // [{err, suite, test, name}]

	// Add Error Log
	// Logs an error into the errors array, however only if we haven't already logged it
	// log = {err,suite,test,name}
	addErrorLog (errorLog) {
		const lastLog = joePrivate.errorLogs[joePrivate.errorLogs.length - 1]
		if ( errorLog.err === (lastLog && lastLog.err) ) {
			// ignore
		}
		else {
			joePrivate.errorLogs.push(errorLog)
		}
		return joePrivate
	},

	// Exited?
	// Whether or not joe has already exited, either via error or via finishing everything it is meant to be doing
	// We store this flag, as we do not want to exit multiple times if we have multiple errors or exit signals
	exited: false,

	// Reports
	// This is a listing of all the reporters we will be using
	// Reporters are what output the results of our tests/suites to the user (Joe just runs them)
	reporters: [],

	// Totals
	// Here are a bunch of totals we use to calculate our progress
	// They are mostly used by reporters, however we do use them to figure out if joe was successful or not
	totalSuites: 0,
	totalPassedSuites: 0,
	totalFailedSuites: 0,
	totalTests: 0,
	totalPassedTests: 0,
	totalFailedTests: 0,

	// Get Reporters
	// If no reporters have been set, attempt to load reporters
	// Reporters will be loaded in order of descending preference
	// the `--joe-reporter=value` command line arguments
	// the `JOE_REPORTER` environment variable
	getReporters () {
		// Check if have no reporters
		if ( joePrivate.reporters.length === 0 ) {
			// Prepare
			const reporters = []

			// Cycle through our CLI arguments
			// looking for --joe-reporter=REPORTER
			if ( process && process.argv ) {
				const args = process.argv
				for ( let i = 0; i < args.length; ++i ) {
					const arg = args[i]
					const reporter = arg.replace(/^--joe-reporter=/, '')
					if ( reporter === arg )  continue
					reporters.push(reporter)
				}
			}

			// If the CLI arguments returned no reporters
			// then attempt the environment variable
			if ( reporters.length === 0 && process && process.env && process.env.JOE_REPORTER ) {
				reporters.push(process.env.JOE_REPORTER)
			}

			// Attempt to load each reporter
			reporters.forEach(function (nameOrPath) {
				// Prepare
				let Reporter = null

				// Attempt joe-reporter-nameOrPath first
				// as require('console') will return the console
				try {
					Reporter = require(`joe-reporter-${nameOrPath}`)
				}
				catch ( nameError ) {
					try {
						Reporter = require(nameOrPath)
					}
					catch ( pathError ) {
						throw new Error(`joe could not find the reporter: ${reporter}`)
					}
				}

				// Instantiate the reporter
				const reporter = new Reporter()

				// Add the reporter
				joe.addReporter(reporter)
			})
		}

		// Return our reporters
		return joePrivate.reporters
	}
}


// =================================
// Public Interface

// Create the interface for Joe
const joe = {
	// Get Totals
	// Fetches all the different types of totals we have collected
	// and determines the incomplete suites and tasks
	// as well as whether or not everything has succeeded correctly (no incomplete, no failures, no errors)
	getTotals () {
		// Fetch
		const {totalSuites, totalPassedSuites, totalFailedSuites, totalTests, totalPassedTests, totalFailedTests, errorLogs} = joePrivate

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
		return joePrivate.errorLogs.slice()
	},

	// Has Errors
	// Returns false if there were no incomplete, no failures and no errors
	hasErrors () {
		return joe.getTotals().success === false
	},

	// Has Exited
	// Returns true if we have exited already
	// we do not want to exit multiple times
	hasExited () {
		return joePrivate.exited === true
	},

	// Has Reportes
	// Do we have any reporters yet?
	hasReporters () {
		return joePrivate.reporters !== 0
	},

	// Add Reporter
	// Add a reporter to the list of reporters we will be using
	addReporter (reporter) {
		// Add joe to the reporter
		reporter.joe = joe

		// Add the reporter to the list of reporters we have
		joePrivate.reporters.push(reporter)

		// Chain
		return joe
	},

	// Set Reporter
	// Clear all the other reporters we may be using, and just use this one
	setReporter (reporterInstance) {
		joePrivate.reporters = []
		if ( reporterInstance ) {
			joe.addReporter(reporterInstance)
		}

		// Chain
		return joe
	},

	// Report
	// Report and event to our reporters
	report (event, ...args) {
		// Fetch the reporters
		const reporters = joePrivate.getReporters()

		// Check we have reporters
		if ( reporters.length === 0 ) {
			console.error('joe has no reporters to log:', event, ...args)
			joe.exit(1)
			return joe
		}

		// For each reporter that we have
		// Trigger the event handler if it exists for it
		for ( let i = 0; i < reporters.length; ++i ) {
			const reporter = reporters[i]
			if ( reporter[event] )  reporter[event](...args)
		}

		// Chain
		return joe
	},

	// Exit
	// Exit our process with the specifeid exitCode
	// If no exitCode is set, then we determine it through the hasErrors call
	exit (exitCode = 0, reason) {
		// Check
		if ( joe.hasExited() )  return
		joePrivate.exited = true

		// Determine exit code
		if ( !exitCode ) {
			exitCode = joe.hasErrors() ? 1 : 0
		}

		// Stop running more tests if we have begun
		const suite = joePrivate.getGlobalSuite()
		if ( suite )  suite.destroy()

		// Report our exit
		joe.report('exit', exitCode, reason)

		// Kill our process with the correct exit code
		if ( process && process.exit ) {
			process.exit(exitCode)
		}

		// Chain
		return joe
	}
}


// =================================
// Interface

// Create our public interface for creating suites and tests
joe.describe = joe.suite = function suite (...args) {
	return joePrivate.getGlobalSuite().suite(...args)
}
joe.it = joe.test = function test (...args) {
	return joePrivate.getGlobalSuite().test(...args)
}

// Freeze our public interface from changes
if ( Object.freeze ) {
	Object.freeze(joe)
}


// =================================
// Events

// On node systems, wait until the process exits
// such that errors that occur outside of the tests can be caught before joe shuts down
if ( process ) {
	process.on('beforeExit', function () {
		joe.exit(0, 'beforeExit')
	})

	process.on('exit', function () {
		joe.exit(0, 'exit')
	})

	// Have last, as this way it won't silence errors that may have occured earlier
	process.on('uncaughtException', function (err) {
		if ( !err )  err = new Error('uncaughtException was emitted without an error')
		joePrivate.addErrorLog({err, name: 'uncaughtException'})
		joe.exit(1, 'uncaughtException')
	})
}

// On browser systems, wait until the tests have finished
else {
	joePrivate.getGlobalSuite().on('destroyed', function () {
		joe.exit(0, 'destroyed')
	})
}


// =================================
// Export

module.exports = joe
