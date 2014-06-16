<!-- TITLE/ -->

# Joe

<!-- /TITLE -->


<!-- BADGES/ -->

[![Build Status](http://img.shields.io/travis-ci/bevry/joe.png?branch=master)](http://travis-ci.org/bevry/joe "Check this project's build status on TravisCI")
[![NPM version](http://badge.fury.io/js/joe.png)](https://npmjs.org/package/joe "View this project on NPM")
[![Dependency Status](https://david-dm.org/bevry/joe.png?theme=shields.io)](https://david-dm.org/bevry/joe)
[![Development Dependency Status](https://david-dm.org/bevry/joe/dev-status.png?theme=shields.io)](https://david-dm.org/bevry/joe#info=devDependencies)<br/>
[![Gittip donate button](http://img.shields.io/gittip/bevry.png)](https://www.gittip.com/bevry/ "Donate weekly to this project using Gittip")
[![Flattr donate button](http://img.shields.io/flattr/donate.png?color=yellow)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](http://img.shields.io/paypal/donate.png?color=yellow)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")
[![BitCoin donate button](http://img.shields.io/bitcoin/donate.png?color=yellow)](https://coinbase.com/checkouts/9ef59f5479eec1d97d63382c9ebcb93a "Donate once-off to this project using BitCoin")
[![Wishlist browse button](http://img.shields.io/wishlist/browse.png?color=yellow)](http://amzn.com/w/2F8TXKSNAFG4V "Buy an item on our wishlist for us")

<!-- /BADGES -->


<!-- DESCRIPTION/ -->

Joe is a JavaScript testing framework that actually works. Unlike Mocha, we won't die on you abruptly when executing dynamically created tests and are always able to associate the correct test to the correct corresponding test suite. Switching from Mocha is trivial and only takes a few minutes.

<!-- /DESCRIPTION -->


<!-- INSTALL/ -->

## Install

### [NPM](http://npmjs.org/)
- Use: `require('joe')`
- Install: `npm install --save joe`

### [Browserify](http://browserify.org/)
- Use: `require('joe')`
- Install: `npm install --save joe`
- CDN URL: `//wzrd.in/bundle/joe@1.5.0`

### [Ender](http://ender.jit.su/)
- Use: `require('joe')`
- Install: `ender add joe`

<!-- /INSTALL -->


## Usage

### Example

``` javascript
// define your test suite
require('joe').describe('suite name', function(describe,it){
	// group together items into sub suites if you desire
	describe('sub suite name', function(describe,it){
		// create both synchronous and asynchronous tests
		it('synchronous test', function(){
			// do your stuff
		});
		it('asynchronous test name', function(complete){
			setTimeout(function(){
				// do your stuff
				complete();
			},500);
		});
		// run a methods before and\or after the test
		function beforeEach(test) {
			// do some pre test stuff
		}
		function afterEach(test, err) {
			// do some post test stuff
		}
		it('before and after options test', {before: beforeEach, after: afterEach}, function(){
			// do your stuff
		});
	});
	// you can also define tests dynamically when using the completion callback on the group
	describe('lets create dynamic tests', function(describe,it,done){
		setTimeout(function(){
			it('a synchronous dynamic test',function(){
				// do your stuff
			});
			done();
		},500)
	});
});
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

## History
[Discover the change history by heading on over to the `HISTORY.md` file.](https://github.com/bevry/joe/blob/master/HISTORY.md#files)

<!-- /HISTORY -->


<!-- CONTRIBUTE/ -->

## Contribute

[Discover how you can contribute by heading on over to the `CONTRIBUTING.md` file.](https://github.com/bevry/joe/blob/master/CONTRIBUTING.md#files)

<!-- /CONTRIBUTE -->


<!-- BACKERS/ -->

## Backers

### Maintainers

These amazing people are maintaining this project:

- Benjamin Lupton <b@lupton.cc> (http://balupton.com)

### Sponsors

No sponsors yet! Will you be the first?

[![Gittip donate button](http://img.shields.io/gittip/bevry.png)](https://www.gittip.com/bevry/ "Donate weekly to this project using Gittip")
[![Flattr donate button](http://img.shields.io/flattr/donate.png?color=yellow)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](http://img.shields.io/paypal/donate.png?color=yellow)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")
[![BitCoin donate button](http://img.shields.io/bitcoin/donate.png?color=yellow)](https://coinbase.com/checkouts/9ef59f5479eec1d97d63382c9ebcb93a "Donate once-off to this project using BitCoin")
[![Wishlist browse button](http://img.shields.io/wishlist/browse.png?color=yellow)](http://amzn.com/w/2F8TXKSNAFG4V "Buy an item on our wishlist for us")

### Contributors

These amazing people have contributed code to this project:

- [balupton](https://github.com/balupton) — [view contributions](https://github.com/bevry/joe/commits?author=balupton)
- [pflannery](https://github.com/pflannery) — [view contributions](https://github.com/bevry/joe/commits?author=pflannery)

[Become a contributor!](https://github.com/bevry/joe/blob/master/CONTRIBUTING.md#files)

<!-- /BACKERS -->


<!-- LICENSE/ -->

## License

Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT license](http://creativecommons.org/licenses/MIT/)

Copyright &copy; 2012+ Bevry Pty Ltd <us@bevry.me> (http://bevry.me)

<!-- /LICENSE -->


