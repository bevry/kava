<!-- TITLE/ -->

<h1>Joe</h1>

<!-- /TITLE -->


<!-- BADGES/ -->

<span class="badge-travisci"><a href="http://travis-ci.org/bevry/joe" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/bevry/joe/master.svg" alt="Travis CI Build Status" /></a></span>
<span class="badge-npmversion"><a href="https://npmjs.org/package/joe" title="View this project on NPM"><img src="https://img.shields.io/npm/v/joe.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/joe" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/joe.svg" alt="NPM downloads" /></a></span>
<span class="badge-daviddm"><a href="https://david-dm.org/bevry/joe" title="View the status of this project's dependencies on DavidDM"><img src="https://img.shields.io/david/bevry/joe.svg" alt="Dependency Status" /></a></span>
<span class="badge-daviddmdev"><a href="https://david-dm.org/bevry/joe#info=devDependencies" title="View the status of this project's development dependencies on DavidDM"><img src="https://img.shields.io/david/dev/bevry/joe.svg" alt="Dev Dependency Status" /></a></span>
<br class="badge-separator" />
<span class="badge-slackin"><a href="https://slack.bevry.me" title="Join this project's slack community"><img src="https://slack.bevry.me/badge.svg" alt="Slack community badge" /></a></span>
<span class="badge-patreon"><a href="http://patreon.com/bevry" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
<span class="badge-gratipay"><a href="https://www.gratipay.com/bevry" title="Donate weekly to this project using Gratipay"><img src="https://img.shields.io/badge/gratipay-donate-yellow.svg" alt="Gratipay donate button" /></a></span>
<span class="badge-flattr"><a href="https://flattr.com/profile/balupton" title="Donate to this project using Flattr"><img src="https://img.shields.io/badge/flattr-donate-yellow.svg" alt="Flattr donate button" /></a></span>
<span class="badge-paypal"><a href="https://bevry.me/paypal" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>
<span class="badge-bitcoin"><a href="https://bevry.me/bitcoin" title="Donate once-off to this project using Bitcoin"><img src="https://img.shields.io/badge/bitcoin-donate-yellow.svg" alt="Bitcoin donate button" /></a></span>
<span class="badge-wishlist"><a href="https://bevry.me/wishlist" title="Buy an item on our wishlist for us"><img src="https://img.shields.io/badge/wishlist-donate-yellow.svg" alt="Wishlist browse button" /></a></span>

<!-- /BADGES -->


<!-- DESCRIPTION/ -->

Joe is a JavaScript testing framework that actually works. Unlike Mocha, we won't die on you abruptly when executing dynamically created tests and are always able to associate the correct test to the correct corresponding test suite. Switching from Mocha is trivial and only takes a few minutes.

<!-- /DESCRIPTION -->


<!-- INSTALL/ -->

<h2>Install</h2>

<a href="https://npmjs.com" title="npm is a package manager for javascript"><h3>NPM</h3></a><ul>
<li>Install: <code>npm install --save joe</code></li>
<li>Module: <code>require('joe')</code></li></ul>

<a href="http://browserify.org" title="Browserify lets you require('modules') in the browser by bundling up all of your dependencies"><h3>Browserify</h3></a><ul>
<li>Install: <code>npm install --save joe</code></li>
<li>Module: <code>require('joe')</code></li>
<li>CDN URL: <code>//wzrd.in/bundle/joe@1.7.0</code></li></ul>

<a href="http://enderjs.com" title="Ender is a full featured package manager for your browser"><h3>Ender</h3></a><ul>
<li>Install: <code>ender add joe</code></li>
<li>Module: <code>require('joe')</code></li></ul>

<h3><a href="https://github.com/bevry/editions" title="Editions are the best way to produce and consume packages you care about.">Editions</a></h3>

<p>This package is published with the following editions:</p>

<ul><li><code>joe/src/lib/joe.coffee</code> is Source + CoffeeScript + <a href="https://nodejs.org/dist/latest-v5.x/docs/api/modules.html" title="Node/CJS Modules">Require</a></li>
<li><code>joe</code> aliases <code>joe/es5/lib/joe.js</code></li>
<li><code>joe/es5/lib/joe.js</code> is CoffeeScript Compiled JavaScript + ES5 + <a href="https://nodejs.org/dist/latest-v5.x/docs/api/modules.html" title="Node/CJS Modules">Require</a></li></ul>

<!-- /INSTALL -->


## Usage

### Example

``` javascript
// define your test suite
require('joe').suite('suite name', function (suite, test) {
	// group together items into sub suites if you desire
	suite('sub suite name', function (suite, test) {
		// create both synchronous and asynchronous tests
		test('synchronous test', function () {
			console.log('do your sync stuff')
		})

		test('asynchronous test name', function (complete) {
			console.log('do your async stuff')
			setTimeout(function () {
				complete()
			}, 500)
		})

		// run a methods before and\or after the test
		function beforeEach(test) {
			console.log('do some pre test stuff')
		}
		function afterEach(test, err) {
			console.log('do some post test stuff')
		}

		test('before and after options test', {before: beforeEach, after: afterEach}, function () {
			console.log('do your before and after stuff')
		})
	})

	// you can also define tests dynamically when using the completion callback on the group
	suite('lets create dynamic tests', function (suite, it, done) {
		setTimeout(function () {
			test('a synchronous dynamic test', function () {
				console.log('do your sync stuff')
			})
			done()
		}, 500)
	})
})
```

```
$ node example.js
suite name
suite name ➞  sub suite name
suite name ➞  sub suite name ➞  synchronous test
suite name ➞  sub suite name ➞  synchronous test ✔   
suite name ➞  sub suite name ➞  asynchronous test name
suite name ➞  sub suite name ➞  asynchronous test name ✔   
suite name ➞  sub suite name ✔  
suite name ➞  lets create dynamic tests
suite name ➞  lets create dynamic tests ➞  a synchronous dynamic test
suite name ➞  lets create dynamic tests ➞  a synchronous dynamic test ✔   
suite name ➞  lets create dynamic tests ✔  
suite name ✔  

3/3 tests ran successfully, everything passed
```


### Complete Documentation

[View the Complete Joe Documentation on the Bevry Website](http://bevry.me/joe/guide)


### Custom Reporters

[Discover the available Custom Reporters for Joe using the `joe-reporter` keyword on the NPM Registry](https://npmjs.org/browse/keyword/joe-reporter)


<!-- HISTORY/ -->

<h2>History</h2>

<a href="https://github.com/bevry/joe/blob/master/HISTORY.md#files">Discover the release history by heading on over to the <code>HISTORY.md</code> file.</a>

<!-- /HISTORY -->


<!-- CONTRIBUTE/ -->

<h2>Contribute</h2>

<a href="https://github.com/bevry/joe/blob/master/CONTRIBUTING.md#files">Discover how you can contribute by heading on over to the <code>CONTRIBUTING.md</code> file.</a>

<!-- /CONTRIBUTE -->


<!-- BACKERS/ -->

<h2>Backers</h2>

<h3>Maintainers</h3>

These amazing people are maintaining this project:

<ul><li><a href="https://balupton.com">Benjamin Lupton</a> — <a href="https://github.com/bevry/joe/commits?author=balupton" title="View the GitHub contributions of Benjamin Lupton on repository bevry/joe">view contributions</a></li></ul>

<h3>Sponsors</h3>

No sponsors yet! Will you be the first?

<span class="badge-patreon"><a href="http://patreon.com/bevry" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
<span class="badge-gratipay"><a href="https://www.gratipay.com/bevry" title="Donate weekly to this project using Gratipay"><img src="https://img.shields.io/badge/gratipay-donate-yellow.svg" alt="Gratipay donate button" /></a></span>
<span class="badge-flattr"><a href="https://flattr.com/profile/balupton" title="Donate to this project using Flattr"><img src="https://img.shields.io/badge/flattr-donate-yellow.svg" alt="Flattr donate button" /></a></span>
<span class="badge-paypal"><a href="https://bevry.me/paypal" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>
<span class="badge-bitcoin"><a href="https://bevry.me/bitcoin" title="Donate once-off to this project using Bitcoin"><img src="https://img.shields.io/badge/bitcoin-donate-yellow.svg" alt="Bitcoin donate button" /></a></span>
<span class="badge-wishlist"><a href="https://bevry.me/wishlist" title="Buy an item on our wishlist for us"><img src="https://img.shields.io/badge/wishlist-donate-yellow.svg" alt="Wishlist browse button" /></a></span>

<h3>Contributors</h3>

These amazing people have contributed code to this project:

<ul><li><a href="https://balupton.com">Benjamin Lupton</a> — <a href="https://github.com/bevry/joe/commits?author=balupton" title="View the GitHub contributions of Benjamin Lupton on repository bevry/joe">view contributions</a></li>
<li><a href="https://github.com/pflannery">Peter Flannery</a> — <a href="https://github.com/bevry/joe/commits?author=pflannery" title="View the GitHub contributions of Peter Flannery on repository bevry/joe">view contributions</a></li></ul>

<a href="https://github.com/bevry/joe/blob/master/CONTRIBUTING.md#files">Discover how you can contribute by heading on over to the <code>CONTRIBUTING.md</code> file.</a>

<!-- /BACKERS -->


<!-- LICENSE/ -->

<h2>License</h2>

Unless stated otherwise all works are:

<ul><li>Copyright &copy; 2012+ <a href="https://bevry.me">Bevry Pty Ltd</a></li></ul>

and licensed under:

<ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

<!-- /LICENSE -->
