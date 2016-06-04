# History

## v1.7.0 2016 June 4
- Updated for TaskGroup v5 and EventEmitterGrouped v2.5.0
- Updated internal conventions

## v1.6.0 2015 February 2
- Updated for TaskGroup v4.2
	- TaskGroup v4.2 should now let us catch more errors in Node v0.10 and above

## v1.5.0 2014 June 16
- Updated for TaskGroup v4.0
	- Closes [issue #9](https://github.com/bevry/joe/issues/9), and [issue #6](https://github.com/bevry/joe/issues/6)
- Added the ability to set before and after listeners for all child tests and suites via
	- `@on('test.before', listener)`
	- `@on('test.after', listener)`
	- `@on('suite.before', listener)`
	- `@on('suite.after', listener)`
	- Closes [issue #8](https://github.com/bevry/joe/issues/8)

## v1.4.0 2014 February 27
- adds before and after fn options for tests

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
