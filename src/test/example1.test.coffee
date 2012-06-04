# Require
assert = require('assert')
joe = require(__dirname+'/../lib/joe')
Reporter = require(__dirname+'/../lib/reporters/console')
joe.reporters.push(new Reporter())

# Our test
suite 'our suite', (suite,test) ->
	test 'first test', (complete) ->
		setTimeout(
			->
				console.log('this will be outputted second')
				complete()
			1000
		)
	test 'second test', ->
		console.log('this will be outputted third')
	console.log('this will be outputted first')