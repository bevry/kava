###
@TODO

- add suite.before, and suite.after examples
- add nested.task.before, nested.task.after, nested.suite.before, nested.suite.after examples
###

# Import
{equal, deepEqual, errorEqual} = require('assert-helpers')
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
			equal(joe.blah?, false, 'modification test')

	suite 'tests', (suite,test) ->

		suite 'async-tests', (suite,test) ->
			checks = []
			test '1/2', (done) -> wait 1*1000, ->
				checks.push(1)
				deepEqual(checks, [1])
				done()
			test '2/2', (done) -> wait 2*1000, ->
				checks.push(2)
				deepEqual(checks, [1, 2])
				done()

		suite 'sync', (suite,test) ->
			checks = []
			test '1/2', ->
				checks.push(1)
				deepEqual(checks, [1])
			test '2/2', ->
				checks.push(2)
				deepEqual(checks, [1, 2])

		suite 'async-sync', (suite,test) ->
			checks = []
			test '1/2', (done) -> wait 1*1000, ->
				checks.push(1)
				deepEqual(checks, [1])
				done()
			test '2/2', ->
				checks.push(2)
				deepEqual(checks, [1, 2])

		suite 'async-suite', (suite,test,done) ->
			checks = []
			wait 1*1000, -> test '1/2', ->
				checks.push(1)
			wait 2*1000, -> test '2/2', ->
				checks.push(2)
			wait 3*1000, ->
				checks.push(3)
				done()
			wait 4*1000, ->
				checks.push(4)
				deepEqual(checks, [3, 1, 2, 4])

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

			test 'test 1', ->
				checks.push('test 1')
				deepEqual(checks, [
					'before - test 1 - part 1',
					'before - test 1 - part 2',
					'test 1'
				])

			test 'test 2', ->
				checks.push('test 2')
				deepEqual(checks, [
					'before - test 1 - part 1',
					'before - test 1 - part 2',
					'test 1'
					'after - test 1 - part 1'
					'after - test 1 - part 2'
					'before - test 2 - part 1'
					'before - test 2 - part 2'
					'test 2'
				])

			before = (test, complete) ->
				checks.push("only before - #{test.config.name} - part 1")
				wait 100, ->
					checks.push("only before - #{test.config.name} - part 2")
					complete()

			after = (test, complete) ->
				checks.push("only after - #{test.config.name} - part 1")
				wait 100, ->
					checks.push("only after - #{test.config.name} - part 2")
					complete()

			test 'test 3', {before,after}, ->
				checks.push('test 3')
				deepEqual(checks, [
					'before - test 1 - part 1',
					'before - test 1 - part 2',
					'test 1'
					'after - test 1 - part 1'
					'after - test 1 - part 2'
					'before - test 2 - part 1'
					'before - test 2 - part 2'
					'test 2'
					'after - test 2 - part 1'
					'after - test 2 - part 2'
					'only before - test 3 - part 1'
					'only before - test 3 - part 2'
					'before - test 3 - part 1'
					'before - test 3 - part 2'
					'test 3'
				], 'test 3 checks')

			test 'test 4', ->
				checks.push('test 4')
				deepEqual(checks, [
					'before - test 1 - part 1',
					'before - test 1 - part 2',
					'test 1'
					'after - test 1 - part 1'
					'after - test 1 - part 2'
					'before - test 2 - part 1'
					'before - test 2 - part 2'
					'test 2'
					'after - test 2 - part 1'
					'after - test 2 - part 2'
					'only before - test 3 - part 1'
					'only before - test 3 - part 2'
					'before - test 3 - part 1'
					'before - test 3 - part 2'
					'test 3'
					'only after - test 3 - part 1'
					'only after - test 3 - part 2'
					'after - test 3 - part 1'
					'after - test 3 - part 2'
					'before - test 4 - part 1'
					'before - test 4 - part 2'
					'test 4'
				], 'test 4 checks')

		suite 'deliberate-failure ignored', (suite,test) ->
			err1 = new Error('deliberate error 1')
			err2 = new Error('deliberate error 2')
			@setConfig(onError: 'ignore')
			test '1/2', ->
				throw err1
			test '2/2', (done) ->
				return done(err2)
			@done (err, results) ->
				errorEqual(err, null)
				deepEqual(results, [[err1], [err2]])

		suite 'deliberate-failure', (suite,test) ->
			test '1/2', (done) -> wait 1*1000, ->
				throw new Error('deliberate error')  # this will nuke the browser as it can't catch async errors
				done() # never reached
			test '2/2', ->  # never reached
				throw new Error('unexpected error')
