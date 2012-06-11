## History

- v1.0.0 June 11, 2012
	- Finalised and cleaned the API

- v0.4.0 June 9, 2012
	- More cleaning

- v0.3.5 June 9, 2012
	- We include `cli-color` now in dependencies and optionalDependencies so it will install for node 0.4 users
	- We now return the correct exit code

- v0.3.4 June 9, 2012
	- Now handles optional dependencies correctly

- v0.3.3 June 9, 2012
	- Added cli-color as an optional and bundled dependency

- v0.3.2 June 9, 2012
	- [bal-util](https://github.com/balupton/bal-util) is now a bundled dependency

- v0.3.1 June 9, 2012
	- Joe no longer exposes globals, use `joe.describe|suite`, and now `joe.test|it`
	- Global suites now run under the suite `joe.globalSuite`, which allows us to auto-exit

- v0.3.0 June 8, 2012
	- Lots of cleaning
	- Abstracted generic code to bal-util

- v0.2.1 June 4, 2012
	- Bugfixes

- v0.2.0 June 4, 2012
	- Added support for reporters

- v0.1.0 June 4, 2012
	- Initial and working commit