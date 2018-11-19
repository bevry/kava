/* eslint no-use-before-define:0, no-console:0, class-methods-use-this:0 */
'use strict'

// Import
const EventEmitterGrouped = require('event-emitter-grouped')
const { Task, TaskGroup } = require('taskgroup')

/**
 * Error Log.
 * @typedef {Object} ErrorLog
 * @property {Error} error
 * @property {Suite} [suite]
 * @property {Test} [test]
 * @property {string} name
 */

/**
 * Error Logs.
 * @typedef {Array<ErrorLog>} ErrorLogs
 */

/**
 * Reporter.
 * @typedef {Object} Reporter
 */

// =================================
// Generic

/**
 * Set Configuration
 * Used by {@link Test.setConfig} and {@link Suite.setConfig} to add support for before and after.
 * @listens before
 * @listens after
 * @returns {Suite|Test} the context of the caller
 * @private
 */
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

/**
 * Run
 * Used by {@link Test.run} and {@link Suite.run} to emit before, and error if it failed.
 * @emits before
 * @emits error
 * @param {function} next
 * @param  {...any} args
 * @returns {Suite|Test} the context of the caller
 * @private
 */
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

/**
 * Finish
 * Used by {@link Test.finish} and {@link Suite.finish} to emit after, and error if it failed.
 * @emits after
 * @emits error
 * @param {function} next
 * @param  {...any} args
 * @returns {Suite|Test} the context of the caller
 * @private
 */
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

/**
 * Test
 * The Test class extends the {@link TaskGroup.Task} class.
 */
class Test extends Task {
	/**
	 * Create a new instance of the Test class with the provided arguments.
	 * @param  {...any} args
	 * @returns {Test}
	 */
	static create (...args) {
		return new this(...args)
	}

	/**
	 * Check if the input is an instance of the Test class.
	 * @param {*} value
	 * @returns {boolean}
	 */
	static isTest (value) {
		return value instanceof Test
	}

	/**
	 * Set Configuration
	 * Fires {@link Task.setConfig}, then fires {@link setConfig}.
	 * @param {...any} args
	 * @returns {this}
	 */
	setConfig (...args) {
		super.setConfig(...args)
		return setConfig.call(this)
	}

	/**
	 * Run
	 * Fires {@link Task.run} , then fires {@link run}.
	 * @param {...any} args
	 * @returns {this}
	 */
	run (...args) {
		return run.call(this, super.run, args)
	}

	/**
	 * Finish
	 * Fires {@link Task.finish}, then fires {@link finish}.
	 * @param {...any} args
	 * @returns {this}
	 */
	finish (...args) {
		return finish.call(this, super.finish, args)
	}
}


// =================================
// Suite

/**
 * Suite
 * The Suite class extends the {@link TaskGroup.TaskGroup} class.
 */
class Suite extends TaskGroup {
	/**
	 * Create a new instance of the Suite class with the provided arguments.
	 * @param  {...any} args
	 * @returns {Suite}
	 */
	static create (...args) {
		return new this(...args)
	}

	/**
	 * Check if the input is an instance of the Suite class.
	 * @param {*} value
	 * @returns {boolean}
	 */
	static isSuite (value) {
		return value instanceof Suite
	}

	/**
	 * Set Configuration
	 * Fires {@link TaskGroup.setConfig}, then fires {@link setConfig}.
	 * @param {...any} args
	 * @returns {this}
	 */
	setConfig (...args) {
		super.setConfig(...args)
		return setConfig.call(this)
	}

	/**
	 * Run
	 * Fires {@link TaskGroup.run} , then fires {@link run}.
	 * @param {...any} args
	 * @returns {this}
	 */
	run (...args) {
		return run.call(this, super.run, ...args)
	}

	/**
	 * Finish
	 * Fires {@link TaskGroup.finish}, then fires {@link finish}.
	 * @param {...any} args
	 * @returns {this}
	 */
	finish (...args) {
		return finish.call(this, super.finish, ...args)
	}

	/**
	 * Wrapper around {@link TaskGroup.addTaskGroup} for creating a nested suite.
	 * @param  {...any} args
	 * @returns {Suite}
	 */
	suite (...args) {
		const suite = new Suite(...args)
		return this.addTaskGroup(suite)
	}

	/**
	 * Alias for {@link Suite.suite}.
	 * @param  {...any} args
	 * @returns {Suite}
	 */
	describe (...args) {
		return this.suite(...args)
	}

	/**
	 * Wrapper around {@link TaskGroup.addTask} for creating a nested test.
	 * @param  {...any} args
	 * @returns {Suite}
	 */
	test (...args) {
		const test = new Test(...args)
		return this.addTask(test)
	}

	/**
	 * Alias for {@link Suite.it}.
	 * @param  {...any} args
	 * @returns {Test}
	 */
	it (...args) {
		return this.test(...args)
	}

	/**
	 * Suite Constructor.
	 * Listens to our added events on the TaskGroup, storing the results, for use for our reporters.
	 * @emits test.before
	 * @emits test.after
	 * @emits suite.before
	 * @emits suite.after
	 * @constructor
	 * @param  {...any} args
	 */
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

	/**
	 * Add Method.
	 * Wrapped around {@link TaskGroup.addMethod} that sets the defaults the taskgroup initializer.
	 * Defaults config.reporting to false, to prevent the initialiser for suites being included in the reporting results.
	 * Defaults config.name to mention that it is a suite initalizer.
	 * Defaults the args to start with {@link Suite.suite} and {@link Suite.test}.
	 * @param {*} method
	 * @param {*} config
	 * @returns {any} whatever {@link TaskGroup.addMethod} returns
	 */
	addMethod (method, config = {}) {
		if (config.reporting == null) config.reporting = false
		if (config.name == null) config.name = `suite initializer for ${this.name}`
		if (config.args == null) config.args = [this.suite.bind(this), this.test.bind(this)]
		return super.addMethod(method, config)
	}


	// =================================
	// Callbacks

	/**
	 * Suite Run Callback.
	 * Handles {@link Private.totalSuites}.
	 * Fires the startSuite report.
	 * @param {Suite} suite
	 * @returns {void}
	 */
	suiteRunCallback (suite) {
		const report = suite.config.reporting !== false

		if (report) {
			++Private.totalSuites
			Public.report('startSuite', suite)
		}
	}

	/**
	 * Suite Complete Callback.
	 * Handles {@link Private.totalFailedSuites}, {@link Private.totalPassedSuites}.
	 * Fires the startSuite report.
	 * @param {Suite} suite
	 * @param {Error?} error
	 * @returns {void}
	 */
	suiteCompleteCallback (suite, error) {
		const report = suite.config.reporting !== false

		if (error) {
			Private.addErrorLog({ error, suite })
			if (report) {
				++Private.totalFailedSuites
			}
		}
		else if (report) {
			++Private.totalPassedSuites
		}

		if (error || report) {
			Public.report('finishSuite', suite, error)
		}
	}

	/**
	 * Test Run Callback.
	 * Handles {@link Private.totalTests}.
	 * Fires the startTest report.
	 * @param {Test} test
	 * @returns {void}
	 */
	testRunCallback (test) {
		const report = test.config.reporting !== false

		if (report) {
			++Private.totalTests
			Public.report('startTest', test)
		}
	}

	/**
	 * Test Complete Callback.
	 * Handles {@link Private.totalFailedTests}, {@link Private.totalPassedTests}.
	 * Fires the finishTest report.
	 * @param {Test} test
	 * @param {Error?} error
	 * @returns {void}
	 */
	testCompleteCallback (test, error) {
		const report = test.config.reporting !== false

		if (error) {
			Private.addErrorLog({ error, test })
			if (report) {
				++Private.totalFailedTests
			}
		}
		else if (report) {
			++Private.totalPassedTests
		}

		if (error || report) {
			Public.report('finishTest', test, error)
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

/**
 * Kava's Private Interface.
 * The reason we have a public and private interface is that we do not want tests being able to modify the test results.
 * As such, the private interface contains properties that must be mutable by the public interface, but not mutable by the bad tests.
 * @private
 * @namespace
 */
const Private = {

	/**
	 * Global Suite.
	 * We use a global suite to contain all of the Suite suites and tests.
	 * @type {Suite?}
	 */
	globalSuite: null,

	/**
	 * Get Global Suite.
	 * We have a getter for the global suite to create it when it is actually needed.
	 * @returns {Suite}
	 */
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

	/**
	 * Error Logs.
	 * We log all the errors that have occured with their suite and test, so the reporters can access them.
	 * @type {ErrorLogs}
	 */
	errorLogs: [],

	/**
	 * Add Error Log.
	 * Logs an error into the errors array, however only if we haven't already logged it.
	 * @param {ErrorLog} errorLog
	 * @returns {Private}
	 */
	addErrorLog (errorLog) {
		const lastLog = this.errorLogs[this.errorLogs.length - 1]
		if (errorLog.error === (lastLog && lastLog.error)) {
			// ignore
		}
		else {
			this.errorLogs.push(errorLog)
		}
		return this
	},

	/**
	 * Exited?
	 * Whether or not we have already exited, either via error or via finishing everything it is meant to be doing.
	 * We store this flag, as we do not want to exit multiple times if we have multiple errors or exit signals.
	 * @type {Boolean}
	 */
	exited: false,

	/**
	 * Reporters.
	 * This is a listing of all the reporters we will be using.
	 * Reporters are what output the results of our tests/suites to the user (we just run them).
	 * @type {Array<Reporter>}
	 */
	reporters: [],

	/**
	 * Total Suites.
	 * The total amount of suites that we are currently aware of.
	 * @type {number}
	 */
	totalSuites: 0,

	/**
	 * Total Passed Suites.
	 * The total amount of passed suites that we are currently aware of.
	 * @type {number}
	 */
	totalPassedSuites: 0,

	/**
	 * Total Failed Suites.
	 * The total amount of failed suites that we are currently aware of.
	 * @type {number}
	 */
	totalFailedSuites: 0,

	/**
	 * Total Tests.
	 * The total amount of tests that we are currently aware of.
	 * @type {number}
	 */
	totalTests: 0,

	/**
	 * Total Passed Tests.
	 * The total amount of passed tests that we are currently aware of.
	 * @type {number}
	 */
	totalPassedTests: 0,

	/**
	 * Total Failed Tests.
	 * The total amount of failed tests that we are currently aware of.
	 * @type {number}
	 */
	totalFailedTests: 0,

	/**
	 * Get Reporters.
	 * If no reporters have been set, attempt to load reporters.
	 * Reporters will be loaded in order of descending preference.
	 * If none are defined, the `KAVA_REPORTER` environment variable is relied upon, and if that doesn't exist, then it will default to console.
	 * @returns {Array<Reporter>}
	 */
	getReporters () {
		// Check if have no reporters
		if (Private.reporters.length === 0) {
			// Prepare
			const reporters = []

			// If there are no reporters, then make use of the KAVA_REPORTER environment variable
			if (process && process.env && process.env.KAVA_REPORTER) {
				reporters.push(process.env.KAVA_REPORTER)
			}
			// Otherwise make use of console
			else {
				reporters.push('console')
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

/**
 * @typedef Totals
 * @property {number} totalSuites
 * @property {number} totalPassedSuites
 * @property {number} totalFailedSuites
 * @property {number} totalIncompleteSuites
 * @property {number} totalTests
 * @property {number} totalPassedTests
 * @property {number} totalFailedTests
 * @property {number} totalIncompleteTests
 * @property {number} totalErrors
 * @property {boolean} success
 *
 */
/**
 * Kava's Public Interface.
 * Creates the publicly accessible interface for Kava, which is exposed via `require('kava')`.
 * @namespace
 */
const Public = {

	/**
	 * Get Totals.
	 * Fetches all the different types of totals we have collected
	 * and determines the incomplete suites and tasks
	 * as well as whether or not everything has succeeded correctly (no incomplete, no failures, no errors)
	 * @returns {Totals}
	 */
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

	/**
	 * Get Errors.
	 * Returns a cloned array of all the error logs.
	 * @returns {ErrorLogs}
	 */
	getErrorLogs () {
		return Private.errorLogs.slice()
	},

	/**
	 * Has Errors.
	 * Returns false if there were no incomplete, no failures and no errors.
	 * @returns {boolean}
	 */
	hasErrors () {
		return this.getTotals().success === false
	},

	/**
	 * Has Exited.
	 * Returns true if we have exited already, as we do not want to exit multiple times.
	 * @returns {boolean}
	 */
	hasExited () {
		return Private.exited === true
	},

	/**
	 * Has Reporters.
	 * Do we have any reporters yet?
	 * @returns {boolean}
	 */
	hasReporters () {
		return Array.isArray(Private.reporters) && Private.reporters.length !== 0
	},

	/**
	 * Add Reporter.
	 * Add a reporter to the list of reporters we will be using.
	 * @param {string} reporter The name or path of the reporter to use.
	 * @param {Object} [config] Any custom configuration that you want to configure the reporter with.
	 * @returns {Reporter}
	 */
	addReporter (reporter, config = {}) {
		// Match
		let path
		switch (reporter) {
			case 'console':
			case 'kava-reporter-console':
				path = './reporters/console/index.js'
				break
			case 'list':
			case 'kava-reporter-list':
				path = './reporters/console/list.js'
				break
			default:
				path = reporter
		}

		// Load
		const Klass = require(path)

		// Instantiate
		config.kava = this
		const instance = new Klass(config)

		// Add the reporter to the list of reporters we have
		Private.reporters.push(instance)

		// Chain
		return instance
	},

	/**
	 * Set Reporter.
	 * Clear all the other reporters we may be using, and just use this one.
	 * @param {string} reporter The name or path of the reporter to use.
	 * @param {Object} [config] Any custom configuration that you want to configure the reporter with.
	 * @returns {Reporter}
	 */
	setReporter (reporter, config) {
		Private.reporters = []
		return this.addReporter(reporter, config)
	},

	/**
	 * Report.
	 * Report an event to our reporters.
	 * @param {string} event
	 * @param {...any} args
	 * @returns {Public}
	 */
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

	/**
	 * Exit.
	 * Exit our process with the specifeid exitCode.
	 * If no exitCode is set, then we determine it through the hasErrors call.
	 * @param {number} [exitCode=0]
	 * @param {string} [reason]
	 * @returns {Public}
	 */
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
	},

	/**
	 * Creates a nested suite on the global suite instance.
	 * @param {...any} args
    * @returns {any} Whatever {@link Suite.suite} returns.
	 */
	suite (...args) {
		return Private.getGlobalSuite().suite(...args)
	},

	/**
	 * Alias for {@link Public.suite}.
	 * @param {...any} args
    * @returns {any} Whatever {@link Suite.suite} returns.
	 */
	describe (...args) {
		return this.suite(...args)
	},

	/**
	 * Creates a nested test on the global suite instance.
	 * @param {...any} args
    * @returns {any} Whatever {@link Suite.test} returns.
	 */
	test (...args) {
		return Private.getGlobalSuite().test(...args)
	},

	/**
	 * Alias for {@link Public.test}.
	 * @param {...any} args
    * @returns {any} Whatever {@link Suite.test} returns.
	 */
	it (...args) {
		return this.test(...args)
	}
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
	process.on('uncaughtException', function (error) {
		if (!error) error = new Error('uncaughtException was emitted without an error')
		Private.addErrorLog({ error, name: 'uncaughtException' })
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
