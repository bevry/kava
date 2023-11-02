'use strict'

module.exports = require('../../tester').tests(
	{ reporter: require.resolve('./index.js') },
	[
		// ------------------------------------
		{
			script: require.resolve('../../examples/multi.js'),
			expected: `
multi sync test example
multi sync test example ✔
multi async test example
multi async test example ✔
multi empty sync suite test example
multi empty sync suite test example ✔
multi empty async suite test example
multi empty async suite test example ✔
multi sync suite example
multi sync suite example ➞ sub sync test example
multi sync suite example ➞ sub sync test example ✔
multi sync suite example ➞ sub async test example
multi sync suite example ➞ sub async test example ✔
multi sync suite example ✔
multi async suite example
multi async suite example ➞ sub sync test example
multi async suite example ➞ sub sync test example ✔
multi async suite example ➞ sub async test example
multi async suite example ➞ sub async test example ✔
multi async suite example ✔
multi extra async test example
multi extra async test example ✔
multi extra sync test example
multi extra sync test example ✔

8/8 tests ran successfully, everything passed`,
		},

		// ------------------------------------
		{
			script: require.resolve('../../examples/timing.js'),
			expected: `
timing example
this will be outputted first
timing example ➞ first test
this will be outputted second
timing example ➞ first test ✔
timing example ➞ second test
this will be outputted third
timing example ➞ second test ✔
timing example ✔

2/2 tests ran successfully, everything passed`,
		},

		// ------------------------------------
		{
			script: require.resolve('../../examples/standard.js'),
			expected: `
standard example
standard example ➞ tests
standard example ➞ tests ➞ async-tests
standard example ➞ tests ➞ async-tests ➞ 1/2
standard example ➞ tests ➞ async-tests ➞ 1/2 ✔
standard example ➞ tests ➞ async-tests ➞ 2/2
standard example ➞ tests ➞ async-tests ➞ 2/2 ✔
standard example ➞ tests ➞ async-tests ✔
standard example ➞ tests ➞ sync
standard example ➞ tests ➞ sync ➞ 1/2
standard example ➞ tests ➞ sync ➞ 1/2 ✔
standard example ➞ tests ➞ sync ➞ 2/2
standard example ➞ tests ➞ sync ➞ 2/2 ✔
standard example ➞ tests ➞ sync ✔
standard example ➞ tests ➞ async-sync
standard example ➞ tests ➞ async-sync ➞ 1/2
standard example ➞ tests ➞ async-sync ➞ 1/2 ✔
standard example ➞ tests ➞ async-sync ➞ 2/2
standard example ➞ tests ➞ async-sync ➞ 2/2 ✔
standard example ➞ tests ➞ async-sync ✔
standard example ➞ tests ➞ async-suite
standard example ➞ tests ➞ async-suite ➞ 1/2
standard example ➞ tests ➞ async-suite ➞ 1/2 ✔
standard example ➞ tests ➞ async-suite ➞ 2/2
standard example ➞ tests ➞ async-suite ➞ 2/2 ✔
standard example ➞ tests ➞ async-suite ✔
standard example ➞ tests ➞ before and after
standard example ➞ tests ➞ before and after ➞ test 1
standard example ➞ tests ➞ before and after ➞ test 1 ✔
standard example ➞ tests ➞ before and after ➞ test 2
standard example ➞ tests ➞ before and after ➞ test 2 ✔
standard example ➞ tests ➞ before and after ➞ test 3
standard example ➞ tests ➞ before and after ➞ test 3 ✔
standard example ➞ tests ➞ before and after ➞ test 4
standard example ➞ tests ➞ before and after ➞ test 4 ✔
standard example ➞ tests ➞ before and after ✔
standard example ➞ tests ➞ deliberate-suite-failure ignored
standard example ➞ tests ➞ deliberate-suite-failure ignored ✔
standard example ➞ tests ➞ deliberate-test-failure ignored
standard example ➞ tests ➞ deliberate-test-failure ignored ➞ 1/2
standard example ➞ tests ➞ deliberate-test-failure ignored ➞ 1/2 ✘
standard example ➞ tests ➞ deliberate-test-failure ignored ➞ 2/2
standard example ➞ tests ➞ deliberate-test-failure ignored ➞ 2/2 ✘
standard example ➞ tests ➞ deliberate-test-failure ignored ✔
standard example ➞ tests ➞ deliberate-test-failure
standard example ➞ tests ➞ deliberate-test-failure ➞ 1/2
standard example ➞ tests ➞ deliberate-test-failure ➞ 1/2 ✘
standard example ➞ tests ➞ deliberate-test-failure ✘
standard example ➞ tests ✘
standard example ✘

FAILURE: 12/15 tests ran successfully; 3 failed, 0 incomplete, 3 errors

Error #1:
standard example ➞ tests ➞ deliberate-test-failure ignored ➞ 1/2
Error: deliberate error 1

Error #2:
standard example ➞ tests ➞ deliberate-test-failure ignored ➞ 2/2
Error: deliberate error 2

Error #3:
standard example ➞ tests ➞ deliberate-test-failure ➞ 1/2
Error: deliberate error`,
		},

		// ------------------------------------
		{
			script: require.resolve('../../examples/fail-never-finish.js'),
			expected: `
fail never finish example

FAILURE: 0/1 tests ran successfully; 0 failed, 1 incomplete, 0 errors`,
		},

		// ------------------------------------
		{
			script: require.resolve('../../examples/fail-throw-suite.js'),
			expected: `
fail throw suite example
fail throw suite example ✘

FAILURE: 0/0 tests ran successfully; 0 failed, 0 incomplete, 1 errors

Error #1:
fail throw suite example
Error: I am the deliberate throw that occurred during the suite`,
		},

		// ------------------------------------
		{
			script: require.resolve('../../examples/fail-throw-test-uncaught.js'),
			expected: `
fail throw test uncaught example
fail throw test uncaught example ➞ throw after timeout
fail throw test uncaught example ➞ throw after timeout ✔
fail throw test uncaught example ✔

FAILURE: 1/1 tests ran successfully; 0 failed, 0 incomplete, 1 errors

Error #1:
uncaughtException
Error: I am the deliberate throw that occurred in the test, but after the test has completed`,
		},

		// All done
	],
)
