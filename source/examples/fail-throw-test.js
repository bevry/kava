# Import
joe = require('../../')

# Test
joe.suite 'deliberate throw suite', (suite,test) ->
	test 'deliberate throw test', ->
		setTimeout(
			->
				throw new Error('I am the deliberate throw')
			10
		)
