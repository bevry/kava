# Require
assert = require?('assert') or @assert
joe = require?(__dirname+'/../lib/joe') or @joe

# Prepare
wait = (delay,fn) -> setTimeout(fn,delay)

# Wait a while, then create our tests
wait 1*1000, ->

	joe.suite 'top suite', (suite,test) ->

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