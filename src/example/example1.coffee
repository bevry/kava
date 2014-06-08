# Import
assert = require('assert')
joe = require('../..')
{expect} = require('chai')

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
			expect(joe.blah?, 'modification test').to.equal(false)

	suite 'tests', (suite,test) ->

		suite 'async-tests', (suite,test) ->
			checks = []
			test '1/2', (done) -> wait 1*1000, ->
				checks.push(1)
				expect(checks).to.deep.equal([1])
				done()
			test '2/2', (done) -> wait 2*1000, ->
				checks.push(2)
				expect(checks).to.deep.equal([1, 2])
				done()

		suite 'sync', (suite,test) ->
			checks = []
			test '1/2', ->
				checks.push(1)
				expect(checks).to.deep.equal([1])
			test '2/2', ->
				checks.push(2)
				expect(checks).to.deep.equal([1, 2])

		suite 'async-sync', (suite,test) ->
			checks = []
			test '1/2', (done) -> wait 1*1000, ->
				checks.push(1)
				expect(checks).to.deep.equal([1])
				done()
			test '2/2', ->
				checks.push(2)
				expect(checks).to.deep.equal([1, 2])

		suite 'async-suite', (suite,test,done) ->
			checks = []
			wait 1*1000, -> test '1/2', ->
				checks.push(1)
				expect(checks).to.deep.equal([1])
			wait 2*1000, -> test '2/2', ->
				checks.push(2)
				expect(checks).to.deep.equal([1, 2])
			wait 3*1000, ->
				expect(checks).to.deep.equal([1, 2])
				done()

		suite 'before and after', (suite,test) ->
			checks = []

			@on 'test.before', (test, complete) ->
				checks.push("before - #{test.config.name} - part 1")
				wait 100, ->
					checks.push("before - #{test.config.name} - part 2")
					complete()

			@on 'test.after', (test, complete) ->
				checks.push("after - #{test.config.name} - part 1")
				wait 100, ->
					checks.push("after - #{test.config.name} - part 2")
					complete()

			test 'test 1/2', ->
				checks.push('test 1/2')
				expect(checks).to.deep.equal([
					'before - test 1/2 - part 1',
					'before - test 1/2 - part 2',
					'test 1/2'
				])

			test 'test 2/2', ->
				checks.push('test 2/2')
				expect(checks).to.deep.equal([
					'before - test 1/2 - part 1',
					'before - test 1/2 - part 2',
					'test 1/2'
					'after - test 1/2 - part 1'
					'after - test 1/2 - part 2'
					'before - test 2/2 - part 1'
					'before - test 2/2 - part 2'
					'test 2/2'
				])

		suite 'deliberate-failure', (suite,test) ->
			test '1/2', (done) -> wait 1*1000, ->
				throw new Error('deliberate error')
				done() # never reached
			test '2/2', ->  # never reached
				throw new Error('unexpected error')
