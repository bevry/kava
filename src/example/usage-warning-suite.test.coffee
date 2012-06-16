# Require
assert = require?('assert') or @assert
joe = require?(__dirname+'/../lib/joe') or @joe

joe.suite '0 args', ->
joe.suite '2 args', (suite,describe) ->
joe.suite '3 args', (suite,describe,complete) ->
joe.suite '1 args', (done) ->
	# This will cause a warning, as tests can only take, 0 or 1 arguments