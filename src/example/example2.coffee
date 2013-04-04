# Import
joe = require('../..')

# Our test
joe.suite 'our suite', (suite,test) ->
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