# Require
assert = require?('assert') or @assert
joe = require?(__dirname+'/../lib/joe') or @joe

# Prepare
wait = (delay,fn) -> setTimeout(fn,delay)

# Wait a while, then create our tests
wait 1*1000, ->

	joe.test 'api is readonly within node', ->
		# Only run if our environment supports this
		if require? and Object.freeze? and process.version.slice(0,4) isnt 'v0.4'
			# Attempt modification
			joe.blah = true

			# Test that the modifications were not successful
			assert.ok(joe.blah? is false)

	joe.suite 'tests', (suite,test) ->

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

		suite 'deliberate-failure', (suite,test) ->
			test '1/2', (done) -> wait 1*1000, ->
				assert.ok(true)
				done()
			test '2/2', ->
				assert.ok(false)
