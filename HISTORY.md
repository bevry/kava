# History

## v1.6.1 March 29, 2017
- Prevent usage with Event Emitter Grouped v2.5.0 as its ES6 class does not give us the prototype fields we need to mix it into our classes
	- Changes semver of it from `^2.4.3` to `~2.4.3`
	- So this release fixes the following issue (which we were encountering with DocPad v6.79 which uses Joe v1.6.0):

		```
		$ npm test

		> joe@1.6.0 test /Users/balupton/Projects/active/joe
		> node out/test/joe-test.js

		/Users/balupton/Projects/active/joe/out/lib/joe.js:186
				this.emitSerial('before', (function(_this) {
						^

		TypeError: this.emitSerial is not a function
			at _Class.run (/Users/balupton/Projects/active/joe/out/lib/joe.js:186:14)
			at Object.getGlobalSuite (/Users/balupton/Projects/active/joe/out/lib/joe.js:331:12)
			at Object.exit (/Users/balupton/Projects/active/joe/out/lib/joe.js:456:18)
			at Object.uncaughtException (/Users/balupton/Projects/active/joe/out/lib/joe.js:477:11)
			at process.<anonymous> (/Users/balupton/Projects/active/joe/out/lib/joe.js:503:18)
			at emitOne (events.js:96:13)
			at process.emit (events.js:191:7)
			at process._fatalException (bootstrap_node.js:301:26)
		THE ABOVE IS -->NOT<-- WHAT WE EXPECTED. TESTS HAVE FAILED
		npm ERR! Test failed.  See above for more details.
		```

## v1.6.0 February 2, 2015
- Updated for TaskGroup v4.2
	- TaskGroup v4.2 should now let us catch more errors in Node v0.10 and above

## v1.5.0 June 16, 2014
- Updated for TaskGroup v4.0
	- Closes [issue #9](https://github.com/bevry/joe/issues/9), and [issue #6](https://github.com/bevry/joe/issues/6)
- Added the ability to set before and after listeners for all child tests and suites via
	- `@on('test.before', listener)`
	- `@on('test.after', listener)`
	- `@on('suite.before', listener)`
	- `@on('suite.after', listener)`
	- Closes [issue #8](https://github.com/bevry/joe/issues/8)

## v1.4.0 February 27, 2014
- adds before and after fn options for tests

## v1.3.2 November 6, 2013
- Updated dependencies
- Repackaged

## v1.3.1 November 1, 2013
- Updated dependencies

## v1.3.0 August 19, 2013
- We now catch uncaught errors within tests and suites

## v1.2.0 April 5, 2013
- Updated to use [TaskGroup](https://npmjs.org/package/taskgroup)
- Reporters now exist in their own packages. [More info.](https://github.com/bevry/joe/wiki/Using-Custom-Reporters)
- No longer output "joe" as the main suite name
- Browser tests now auto exit after the last test has run

## v1.1.2 March 23, 2013
- Updated dependencies

## v1.1.1 October 25, 2012
- Build improvements
- Updated [bal-util](https://github.com/balupton/bal-util) from v1.3 to v1.15
- Updated [coffee-script](https://github.com/jashkenas/coffee-script) devDependency from 1.3 to 1.4

## v1.1.0 October 25, 2012
- Updated [cli-color](https://github.com/medikoo/cli-color) from v0.1 to v0.2
- Updated [bal-util](https://github.com/balupton/bal-util) from v1.11 to v1.13
	- Update: turns out I actually specified v1.3 instead of v1.13 - it works, but not desirable, fixed in v1.1.1

## v1.0.3 August 9, 2012
- Windows support
- Re-added markdown files to npm distribution as they are required for the npm website

## v1.0.2 July 4, 2012
- We now error on incomplete tasks
- Joe now handles (instead of reporters):
	- the counting of total, passed, failed and incomplete suites and tests
	- the logging of errors with their suites sand tests
	- the fetching of suite and test names (including their parents)

## v1.0.1 June 11, 2012
- Joe will now throw errors if you have an incorrect amount of arguments for your `suite` and `test` callbacks

## v1.0.0 June 11, 2012
- Finalised and cleaned the API

## v0.4.0 June 9, 2012
- More cleaning

## v0.3.5 June 9, 2012
- We include `cli-color` now in dependencies and optionalDependencies so it will install for node 0.4 users
- We now return the correct exit code

## v0.3.4 June 9, 2012
- Now handles optional dependencies correctly

## v0.3.3 June 9, 2012
- Added cli-color as an optional and bundled dependency

## v0.3.2 June 9, 2012
- [bal-util](https://github.com/balupton/bal-util) is now a bundled dependency

## v0.3.1 June 9, 2012
- Joe no longer exposes globals, use `joe.describe|suite`, and now `joe.test|it`
- Global suites now run under the suite `joe.globalSuite`, which allows us to auto-exit

## v0.3.0 June 8, 2012
- Lots of cleaning
- Abstracted generic code to bal-util

## v0.2.1 June 4, 2012
- Bugfixes

## v0.2.0 June 4, 2012
- Added support for reporters

## v0.1.0 June 4, 2012
- Initial and working commit