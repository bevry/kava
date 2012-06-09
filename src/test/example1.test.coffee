# Require
assert = require('assert')
joe = require(__dirname+'/../lib/joe')
joe.setDefaultReporter ->
	Reporter = joe.require('reporters/console')
	new Reporter()

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