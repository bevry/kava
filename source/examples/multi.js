/* eslint no-console:0, no-implicit-coercion:0 */
'use strict'

// Import
const kava = require('../index.js')

// Tests
kava.test('multi sync test example', function () { })
kava.test('multi async test example', function (done) {
	setTimeout(done, 1000)
})

// Suites
kava.suite('multi empty sync suite test example', function () { })
kava.suite('multi empty async suite test example', function (suite, test, done) {
	done()
})

// Nested
kava.suite('multi sync suite example', function (suite, test) {
	test('sub sync test example', function () { })
	test('sub async test example', function (done) {
		setTimeout(done, 1000)
	})
})
kava.suite('multi async suite example', function (suite, test, done) {
	test('sub sync test example', function () { })
	test('sub async test example', function (done) {
		setTimeout(done, 1000)
	})
	done()
})

// Nested nested handled by standard.js

// Finish with some more tests for good measure
kava.test('multi extra async test example', function (done) {
	setTimeout(done, 1000)
})
kava.test('multi extra sync test example', function () { })
