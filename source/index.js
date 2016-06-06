/* eslint no-use-before-define:1 */

// Import
const util = require('util')
const EventEmitterGrouped = require('event-emitter-grouped')
const {Task, TaskGroup} = require('taskgroup')

// Prepare
const isBrowser = typeof window !== 'undefined'
const isWindows = process && process.platform && process.platform.indexOf('win') === 0

// =================================
// Generic

function setConfig () {
	const me = this
	const {before, after} = this.config
	if ( before ) {
		delete this.config.before
		this.on('before', function (complete) {
			before.call(this, me, complete)
		})
	}
	if ( after ) {
		delete this.config.after
		this.on('after', function (complete) {
			after.call(this, me, complete)
		})
	}
	return this
}

function run (next, args) {
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

function finish (next, args) {
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
		return run.call(this, super.run, args)
	}

	finish (...args) {
		return finish.call(this, super.finish, args)
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

		/*
		// Nested Listeners
		function nestedListener (item) {
			if ( Test.isTest(item) ) {
				item.on('before', function (complete) {
					me.emitSerial('nested.test.before', item, complete)
				})
				item.on('after', function (complete) {
					me.emitSerial('nested.test.after', item, complete)
				})
			}
			else if ( Suite.isSuite(item) ) {
				item.on('item.add', nestedListener)
				item.on('before', function (complete) {
					me.emitSerial('nested.suite.before', item, complete)
				})
				item.on('after', function (complete) {
					me.emitSerial('nested.suite.after', item, complete)
				})
			}
		}
		*/

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
					me.emitSerial('test.before', item, complete)
				})
				item.on('after', function (complete) {
					me.emitSerial('test.after', item, complete)
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
					me.emitSerial('suite.before', item, complete)
				})
				item.on('after', function (complete) {
					me.emitSerial('suite.after', item, complete)
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
		if ( config.name == null )  config.name = false
		if ( config.args == null )  config.args = [this.suite.bind(this), this.test.bind(this)]
		return super.addMethod(method, config)
	}


	// =================================
	// Callbacks

	suiteRunCallback (suite) {
		const config = suite.config
		if ( config.reporting !== false ) {
			++joePrivate.totalSuites
			joe.report('startSuite', suite)
		}
	}

	suiteCompleteCallback (suite, err) {
		const config = suite.config

		if ( err ) {
			joePrivate.addErrorLog({suite, err})
			if ( config.reporting !== false ) {
				++joePrivate.totalFailedSuites
			}
		}

		else if ( config.reporting !== false ) {
			++joePrivate.totalPassedSuites
		}

		if ( config.reporting !== false ) {
			joe.report('finishSuite', suite, err)
		}
	}

	testRunCallback (test) {
		const config = test.config

		if ( config.reporting !== false ) {
			++joePrivate.totalTests
			joe.report('startTest', test)
		}
	}

	testCompleteCallback (test, err) {
		const config = test.config

		if ( err ) {
			joePrivate.addErrorLog({test, err})
			if ( config.reporting !== false ) {
				++joePrivate.totalFailedTests
			}
		}

		else if ( config.reporting !== false ) {
			++joePrivate.totalPassedTests
		}

		if ( config.reporting !== false ) {
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
				name: false
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
	// Fetches our reporters when we need them, if none are set,
	// then we fetch the reporter specified by the CLI arguments (if running in the CL), or the default reporter for the environment
	getReporters () {
		// Check if have no reporters
		if ( joePrivate.reporters.length === 0 ) {
			// Prepare
			let reporterName = 'console'

			// Cycle through our CLI arguments
			// to see if we can override our reporterName with one specified by the CLI
			const args = process && process.argv || []
			for ( const arg of args ) {
				// Do we have our --joe-reporter=REPORTER argument?
				const argResult = arg.replace(/^--joe-reporter=/, '')
				if ( argResult !== arg ) {
					reporterName = argResult
					break
				}
			}

			// Load our default reporter
			try {
				joe.addReporter(reporterName)
			}
			catch ( err ) {
				console.error(
					`Joe could not load the reporter: ${reporterName}\n` +
					"Perhaps it's not installed? Try install it using:\n" +
					`\tnpm install --save-dev joe-reporter-${reporterName}\n` +
					'The exact error was:\n' +
					(err.stack || err.message || err)
				)
				joe.exit(1)
				return
			}
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
	addReporter (reporterInstance) {
		// Load the reporter
		if ( typeof reporterInstance === 'string' ) {
			const Reporter = require(`joe-reporter-${reporterInstance}`)
			reporterInstance = new Reporter()
		}

		// Add joe to the reporter
		reporterInstance.joe = joe

		// Add the reporter to the list of reporters we have
		joePrivate.reporters.push(reporterInstance)

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
			console.error('Joe has no reporters loaded, so cannot log anything...')
			joe.exit(1)
			return joe
		}

		// For each reporter that we have
		// Trigger the event handler if it exists for it
		for ( const reporter of reporters ) {
			if ( reporter[event] ) {
				reporter[event](...args)
			}
		}

		// Chain
		return joe
	},

	// Exit
	// Exit our process with the specifeid exitCode
	// If no exitCode is set, then we determine it through the hasErrors call
	exit (exitCode) {
		// Check
		if ( joe.hasExited() ) {
			return
		}
		joePrivate.exited = true

		// Determine exit code
		if ( exitCode == null ) {
			exitCode = joe.hasErrors() ? 1 : 0
		}

		// Stop running more tests if we have begun
		const suite = joePrivate.getGlobalSuite()
		if ( suite ) {
			suite.destroy()
		}

		// Report our exit
		joe.report('exit', exitCode)

		// Kill our process with the correct exit code
		if ( process && process.exit ) {
			process.exit(exitCode)
		}

		// Chain
		return joe
	},

	// Uncaught Exception
	// Log an uncaughtException and die
	uncaughtException (err) {
		// Check
		if ( joe.hasExited() ) {
			return
		}

		// Report
		if ( !util.isError(err) ) {
			err = new Error(err)
		}
		joePrivate.addErrorLog({name: 'uncaughtException', err})
		joe.report('uncaughtException', err)
		joe.exit(1)

		// Chain
		return joe
	},

	// Get Item Name
	getItemName (item, separator) {
		return item.names.join(separator)
	}
}


// =================================
// Setup

// Bubbled uncaught exceptions
joePrivate.getGlobalSuite().done(function (err) {
	if ( err ) {
		joe.uncaughtException(err)
	}
})

// Interface
// Create our public interface for creating suites and tests
joe.describe = joe.suite = function suite (...args) {
	return joePrivate.getGlobalSuite().suite(...args)
}
joe.it = joe.test = function test (...args) {
	return joePrivate.getGlobalSuite().test(...args)
}

// Freeze our public interface from changes
if ( !isBrowser && Object.freeze ) {
	Object.freeze(joe)
}

// Handle system events
// Have this last, as this way it won't silence errors that may have occured earlier
if ( process != null ) {
	if ( !isWindows ) {
		process.on('SIGINT', function () {
			joe.exit()
		})
	}

	process.on('exit', function () {
		joe.exit()
	})

	process.on('uncaughtException', function (err) {
		joe.uncaughtException(err)
	})
}

// Export
module.exports = joe
