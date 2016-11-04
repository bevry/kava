# History

## v2.0.2 2016 November 4
- Fixed `--joe-reporter=console` not working (regression since v2.0.0)
- Fixed early node compatibility properly (initial attempt was in v2.0.0)

## v2.0.1 2016 November 4
- Fixed tests not being published to npm for use in the testing ecosystem

## v2.0.0 2016 November 4
This release contains several major improvements to internals and undocumented functionality, which potentially impact backwards compatibility with before and after hooks, and reporter functionality. For the average end-user these should be non-functional changes and should just improve the quality of the reports that joe generates.

- The before and after hooks are now stable and documented
	- `before` and `after` listers fire with the context as the item they are bound to, receiving no arguments besides the optional completion callback
  - `task.before`, `task.after`, `suite.before`, `suite.after` listeners fire with the context as the suite they are bound to, receiving the first argument as the item for the hook, as well as the optional completion callback
- Suite initialiser methods now get descriptive names instead of no name
- If a suite or test encounter an error, the `finish[Test|Suite]` reporting now always occurs regardless of `reporting` preference
- The global suite now has a name of `global joe suite`, it is up to the reporters to filter this out
- Reporter can now be specified via the `JOE_REPORTER` environment variable
- Reporter must now be specified, no longer defaults to `joe-reporter-console`
- `--joe-reporter` and `JOE_REPORTER` can now point to paths to load
- `setReporter` now expects to receive a reporter instance
- Exit reporting now contains the reason for the exit as the second argument
- `getItemName` has now been removed, it should be handled by the reporters instead
- `uncaughtException` method has been removed, it doesn't make sense being an API call
- Simplified cross environment (browser, windows, etc) handling
- Exiting should now be more reliable across different node versions and browser environments
  - browsers will now have exit reporting by waiting for the global suite to destroy
  - on node
    - joe will now listen to `beforeExit` so exits can perform more reliably
    - joe will no longer bother with `SIGINT` on windows as `beforeExit` should now accomplish that
    - joe will no longer listen to the global suites completion event to exit, now it just listens to the `beforeExit`, `exit`, and `uncaughtException` events
      - this is groundwork to solving [issue #19](https://github.com/bevry/joe/issues/19) (a regression since v1.8.0)
- Early node version support added once again without the need of a polyfill
- Moved examples out from this repository into the new [`joe-examples` repository](https://github.com/bevry/joe-examples)
- Testing infrastructure now tests the most common reporters against the most common examples
- Updated base files

## v1.8.0 2016 June 4
- Converted from CoffeeScript to ESNext

## v1.7.0 2016 June 4
- Updated for TaskGroup v5 and EventEmitterGrouped v2.5.0
- Updated internal conventions

## v1.6.0 2015 February 2
- Updated for TaskGroup v4.2
	- TaskGroup v4.2 should now let us catch more errors in Node v0.10 and above

## v1.5.0 2014 June 16
- Updated for TaskGroup v4.0
	- Closes [issue #9](https://github.com/bevry/joe/issues/9), and [issue #6](https://github.com/bevry/joe/issues/6)
- Added ability to set before and after listeners for all child tests and suites
	- `this.on('test.before', listener)`
	- `this.on('test.after', listener)`
	- `this.on('suite.before', listener)`
	- `this.on('suite.after', listener)`
	- Closes [issue #8](https://github.com/bevry/joe/issues/8)

## v1.4.0 2014 February 27
- Added before and after hooks

## v1.3.2 2013 November 6
- Updated dependencies
- Repackaged

## v1.3.1 2013 November 1
- Updated dependencies

## v1.3.0 2013 August 19
- We now catch uncaught errors within tests and suites

## v1.2.0 2013 April 5
- Updated to use [TaskGroup](https://npmjs.org/package/taskgroup)
- Reporters now exist in their own packages. [More info.](https://github.com/bevry/joe/wiki/Using-Custom-Reporters)
- No longer output "joe" as the main suite name
- Browser tests now auto exit after the last test has run

## v1.1.2 2013 March 23
- Updated dependencies

## v1.1.1 2012 October 25
- Build improvements
- Updated [bal-util](https://github.com/balupton/bal-util) from v1.3 to v1.15
- Updated [coffee-script](https://github.com/jashkenas/coffee-script) devDependency from 1.3 to 1.4

## v1.1.0 2012 October 25
- Updated [cli-color](https://github.com/medikoo/cli-color) from v0.1 to v0.2
- Updated [bal-util](https://github.com/balupton/bal-util) from v1.11 to v1.13
	- Update: turns out I actually specified v1.3 instead of v1.13 - it works, but not desirable, fixed in v1.1.1

## v1.0.3 2012 August 9
- Windows support
- Re-added markdown files to npm distribution as they are required for the npm website

## v1.0.2 2012 July 4
- We now error on incomplete tasks
- Joe now handles (instead of reporters):
	- the counting of total, passed, failed and incomplete suites and tests
	- the logging of errors with their suites sand tests
	- the fetching of suite and test names (including their parents)

## v1.0.1 2012 June 11
- Joe will now throw errors if you have an incorrect amount of arguments for your `suite` and `test` callbacks

## v1.0.0 2012 June 11
- Finalised and cleaned the API

## v0.4.0 2012 June 9
- More cleaning

## v0.3.5 2012 June 9
- We include `cli-color` now in dependencies and optionalDependencies so it will install for node 0.4 users
- We now return the correct exit code

## v0.3.4 2012 June 9
- Now handles optional dependencies correctly

## v0.3.3 2012 June 9
- Added cli-color as an optional and bundled dependency

## v0.3.2 2012 June 9
- [bal-util](https://github.com/balupton/bal-util) is now a bundled dependency

## v0.3.1 2012 June 9
- Joe no longer exposes globals, use `joe.describe|suite`, and now `joe.test|it`
- Global suites now run under the suite `joe.globalSuite`, which allows us to auto-exit

## v0.3.0 2012 June 8
- Lots of cleaning
- Abstracted generic code to bal-util

## v0.2.1 2012 June 4
- Bugfixes

## v0.2.0 2012 June 4
- Added support for reporters

## v0.1.0 2012 June 4
- Initial and working commit
