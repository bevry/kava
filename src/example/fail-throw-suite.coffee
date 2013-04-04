# Import
joe = require('../..')

# Test
joe.suite 'deliberate throw suite', ->
	throw new Error('I am the deliberate throw')