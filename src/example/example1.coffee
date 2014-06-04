# Import
assert = require('assert')
joe = require('../..')

# Prepare
wait = (delay,fn) -> setTimeout(fn,delay)

# Wait a while, then create our tests
joe.suite 'example1', (suite,test) ->

	test 'api is readonly within node', ->
		# Only run if our environment supports this
		if window? is false
			# Attempt modification
			joe.blah = true

			# Test that the modifications were not successful
			assert.ok(joe.blah? is false)

	suite 'tests', (suite,test) ->

		suite 'async-suite', (suite,test,done) ->
			wait 1*1000, -> test '1/2', ->
				assert.ok(true)
			wait 2*1000, -> test '2/2', ->
				assert.ok(true)
			wait 3*1000, ->
				done()

		suite 'async-tests', (suite,test) ->
			test '1/2', (done) -> wait 1*1000, ->
				assert.ok(true)
				done()
			test '2/2', (done) -> wait 2*1000, ->
				assert.ok(true)
				done()

		suite 'sync', (suite,test) ->
			test '1/2', ->
				assert.ok(true)
			test '2/2', ->
				assert.ok(true)

		suite 'async-sync', (suite,test) ->
			test '1/2', (done) -> wait 1*1000, ->
				assert.ok(true)
				done()
			test '2/2', ->
				assert.ok(true)

		suite 'before-each', (suite,test) ->
			testValue = 0

			beforeEach = (test) ->
				testValue++

			test '1/2', before: beforeEach, ->
				assert.equal(testValue, 1)
			test '2/2', before: beforeEach, ->
				assert.equal(testValue, 2)

		suite 'after-each', (suite,test) ->
			testValue = 0

			afterEach = (test, err) ->
				testValue++

			test '1/2', after: afterEach, ->
				assert.equal(testValue, 0)
			test '2/2', after: afterEach, ->
				assert.equal(testValue, 1)

		suite 'deliberate-failure', (suite,test) ->
			test '1/2', (done) -> wait 1*1000, ->
				assert.ok(false)
			test '2/2', ->  # never reached
				assert.ok(false)
