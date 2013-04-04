# Require
assert = require?('assert') or @assert
joe = require?(__dirname+'/../lib/joe') or @joe

joe.suite 'deliberate throw suite', ->
	throw new Error('I am the deliberate throw')