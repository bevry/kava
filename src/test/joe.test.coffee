# Require
assert = if require? then require('assert') else @assert
joe = if require? then require(__dirname+'/../lib/joe') else @joe
Reporter = if require? then require(__dirname+'/../lib/reporters/list') else @joe.ConsoleReporter
joe.reporters.push(new Reporter())

# Prepare
wait = (delay,fn) -> setTimeout(fn,delay)

# Wait a while, then create our tests
wait 5*1000, ->

	suite 'parent', (suite,test) ->

		suite 'async-suite', (suite,test,done) ->
			#@setTimeout(4*1000)
			wait 1*1000, -> test '1/2', ->
				assert.ok(true)
			wait 2*1000, -> test '2/2', ->
				assert.ok(true)
			wait 3*1000, ->
				done()

		suite 'async-tests', (suite,test) ->
			#@setTimeout(3*1000)
			test '1/2', (done) -> wait 1*1000, ->
				assert.ok(true)
				done()
			test '2/2', (done) -> wait 2*1000, ->
				assert.ok(true)
				done()

		suite 'sync', (suite,test) ->
			#@setTimeout(1*1000)
			test '1/2', ->
				assert.ok(true)
			test '2/2', ->
				assert.ok(true)

		suite 'async-sync', (suite,test) ->
			#@setTimeout(2*1000)
			test '1/2', (done) -> wait 1*1000, ->
				assert.ok(true)
				done()
			test '2/2', ->
				assert.ok(true)

		suite 'deliberate-failure', (suite,test) ->
			#@setTimeout(2*1000)
			test '1/2', (done) -> wait 1*1000, ->
				assert.ok(true)
				done()
			test '2/2', ->
				assert.ok(false)