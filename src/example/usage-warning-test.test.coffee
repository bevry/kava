# Require
assert = require?('assert') or @assert
joe = require?(__dirname+'/../lib/joe') or @joe

joe.test '0 args', ->
joe.test '1 args', (done) ->
joe.test 'two args', (suite,describe) ->
	# This will cause a warning, as tests can only take, 0 or 1 arguments