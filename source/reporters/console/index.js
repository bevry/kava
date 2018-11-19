/* eslint no-console:0 */
'use strict'

// Prepare
const isWindows = process && process.platform && process.platform.indexOf('win') === 0

// Optional
let cliColor = null
if (process) {
	try {
		cliColor = require('cli-color')
	}
	catch (e) { }
}

/**
 * Console Reporter for Kava.
 * Kava attaches and calls the methods of this classes instance.
 * @example
 * const kava = require('kava')
 * kava.addReporter('console')
 * kava.suite('as usual', (suite, test) => {})
 * @constructor
 * @param {Object} [config]
 * @param {boolean} [config.color] - Enabled by default if not in the web browser, or `--no-colors` command line argument is missing
 * @param {boolean} [config.utf8] - Enabled by default if not on Windows
 * @param {string} [config.itemStart] - What to display when an item starts
 * @param {string} [config.markFail] - What to display when an item fails
 * @param {string} [config.markPass] - What to display when an item passes
 * @param {string} [config.itemArrow] - What to join item names with
 * @param {string} [config.summaryError] - What to display for error logs
 * @param {string} [config.summaryPass] - What to display if all goes well
 * @param {string} [config.summaryFail] - What to display if all went badly
 * @public
*/
class ConsoleReporter {
	constructor (config = {}) {
		this.errors = []
		this.config = config

		// Defaults
		if (this.config.color == null) this.config.color = ((process && process.argv) || []).indexOf('--no-colors') === -1
		if (this.config.utf8 == null) this.config.utf8 = !isWindows
		if (this.config.markFail == null) this.config.markFail = this.config.utf8 ? '✘' : 'ERR!'
		if (this.config.markPass == null) this.config.markPass = this.config.utf8 ? '✔' : 'OK  '
		if (this.config.itemNames == null) this.config.itemNames = this.config.utf8 ? '$a ➞ $b' : '$a > $b'
		if (this.config.itemStart == null) this.config.itemStart = '$name'
		if (this.config.itemFinish == null) this.config.itemFinish = '$name $mark'
		if (this.config.summaryError == null) this.config.summaryError = '\nError #$index:\n$name\n$error'
		if (this.config.summaryPass == null) this.config.summaryPass = '\n$totalPassedTests/$totalTests tests ran successfully, everything passed'
		if (this.config.summaryFail == null) this.config.summaryFail = '\nFAILURE: $totalPassedTests/$totalTests tests ran successfully; $totalFailedTests failed, $totalIncompleteTests incomplete, $totalErrors errors'

		// Colors
		if (cliColor && this.config.color) {
			this.config.markFail = cliColor.red(this.config.markFail)
			this.config.markPass = cliColor.green(this.config.markPass)
			this.config.itemArrow = cliColor.black(this.config.itemArrow)
			this.config.summaryError = cliColor.red.underline(this.config.summaryError)
			this.config.summaryPass = cliColor.green.underline(this.config.summaryPass)
			this.config.summaryFail = cliColor.red.bold.underline(this.config.summaryFail)
		}
	}

	/**
	 * Creates and returns new instance of the current class.
	 * @param {...*} args - The arguments to be forwarded along to the constructor.
	 * @return {Object} The new instance.
	 * @static
	 * @public
	 */
	static create (...args) {
		return new this(...args)
	}

	/**
	 * Fetches the combined name of an item, paired with its parents.
	 * @param {Suite|Test} item
	 * @returns {string}
	 * @access private
	 */
	getItemName (item) {
		return item.names.filter((name) => name !== 'global kava suite').reduce((a, b) => this.formatMessage(this.config.itemNames, { a, b }))
	}

	/**
	 * Injects the options into the message, when the option key is prefixed by a $
	 * @param {string} message
	 * @param {Object} opts
	 * @returns {string}
	 * @access private
	 */
	/* eslint class-methods-use-this:0 */
	formatMessage (message, opts) {
		Object.keys(opts).forEach(function (key) {
			const value = opts[key]
			message = message.replace('$' + key, value)
		})
		return message
	}

	/**
	 * Report that a suite has started.
	 * @param {Suite} suite
	 * @returns {this}
	 * @chainable
	 * @access protected
	 */
	startSuite (suite) {
		const format = this.config.itemStart
		if (!format) return this

		const name = this.getItemName(suite)
		if (!name) return this

		const message = this.formatMessage(format, { name })
		if (!message) return this

		console.log(message)
		return this
	}

	/**
	 * Report that a suite has finished.
	 * @param {Suite} suite
	 * @param {Error} [err]
	 * @returns {this}
	 * @chainable
	 * @access protected
	 */
	finishSuite (suite, err) {
		const format = this.config.itemFinish
		if (!format) return this

		const name = this.getItemName(suite)
		if (!name) return this

		const mark = err ? this.config.markFail : this.config.markPass
		const message = this.formatMessage(format, { name, mark })
		if (!message) return this

		console.log(message)
		return this
	}

	/**
	 * Report that a test has started.
	 * @param {Test} test
	 * @returns {this}
	 * @chainable
	 * @access protected
	 */
	startTest (test) {
		const format = this.config.itemStart
		if (!format) return this

		const name = this.getItemName(test)
		if (!name) return this

		const message = this.formatMessage(format, { name })
		if (!message) return this

		console.log(message)
		return this
	}

	/**
	 * Report that a test has finished.
	 * @param {Test} test
	 * @param {Error} [err]
	 * @returns {this}
	 * @chainable
	 * @access protected
	 */
	finishTest (test, err) {
		const format = this.config.itemFinish
		if (!format) return this

		const name = this.getItemName(test)
		if (!name) return this

		const mark = err ? this.config.markFail : this.config.markPass
		const message = this.formatMessage(format, { name, mark })
		if (!message) return this

		console.log(message)

		return this
	}

	/**
	 * Report the summary when kava exits.
	 * @param {number} exitCode
	 * @returns {this}
	 * @chainable
	 * @access protected
	 */
	exit (exitCode) {
		const totals = this.config.kava.getTotals()
		console.log(exitCode
			? this.formatMessage(this.config.summaryFail, totals)
			: this.formatMessage(this.config.summaryPass, totals)
		)
		this.config.kava.getErrorLogs().forEach((errorLog, index) => {
			const { suite, test, name, err } = errorLog
			const item = test || suite
			const message = this.formatMessage(this.config.summaryError, {
				index: index + 1,
				name: name || this.getItemName(item),
				error: err.fullStack || err.stack || err.message || err
			})
			console.log(message)
		})
		return this
	}
}

// Export
module.exports = ConsoleReporter
