/* eslint no-console:0 */
'use strict'

const ConsoleReporter = require('../console/index.js')

/**
 * List Reporter for Kava.
 * Kava attaches and calls the methods of this classes instance.
 * @example
 * const kava = require('kava')
 * kava.addReporter('list')
 * kava.suite('as usual', (suite, test) => {})
 * @constructor
 * @class ListReporter
 * @extends ConsoleReporter
 * @public
 */
class ListReporter extends ConsoleReporter {
	/**
	 * Set the configuration for our instance.
	 * @param {...*} args
	 * @public
	*/
	constructor (...args) {
		super(...args)

		// Defaults
		if (this.config.markFail == null) this.config.markFail = this.config.utf8 ? '✘ ' : 'ERR! '
		if (this.config.markPass == null) this.config.markPass = this.config.utf8 ? '✔ ' : 'OK   '

		// Overrides
		this.config.itemFinish = '$mark $name'
	}

	/**
	 * Override the console reporters start suite to do nothing
	 * @returns {this}
	 */
	startSuite () {
		return this
	}

	/**
	 * Override the console reporters start test to do nothing
	 * @returns {this}
	 */
	startTest () {
		return this
	}

	/**
	 * Override the console reporters finish suite to do nothing
	 * @param {Suite} suite
	 * @param {Error} [error]
	 * @returns {this}
	 * @chainable
	 * @access protected
	 */
	finishSuite (suite, error) {
		if (error) return super.finishSuite(suite, error)
		return this
	}
}

// Export
module.exports = ListReporter
