# Requires
{spawn} = require('child_process')
assert = require('assert')

# Prepare
everythingTestPath = __dirname+'/../example/everything.test.js'
expected = "10/11 tests ran successfully, with 1 errors"

# Test
stdout = ''
runner = spawn('node', [everythingTestPath])
runner.stdout.on 'data', (data) ->
	stdout += data
	process.stdout.write(data)
runner.stderr.on 'data', (data) ->
	process.stderr.write(data)
runner.on 'exit', (code) ->
	result = stdout.indexOf(expected) isnt -1
	message = 'THE ABOVE WAS EXACTLY WHAT WE EXPECTED. TESTS HAVE PASSED!'
	assert.ok(result, message)
	console.log(message)