# Require
assert = require?('assert') or @assert
joe = require?(__dirname+'/../lib/joe') or @joe

joe.test 'never finish', (done) ->