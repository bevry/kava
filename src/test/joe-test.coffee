# Requires
{spawn} = require('child_process')
assert = require('assert')

# Prepare
everythingTestPath = __dirname+'/../example/example1.js'
expected = "13/14 tests ran successfully"

# Test Default Reporter
stdout = ''
runner = spawn('node', [everythingTestPath])
runner.stdout.on 'data', (data) ->
	stdout += data
	process.stdout.write(data)
runner.stderr.on 'data', (data) ->
	process.stderr.write(data)
runner.on 'exit', (code) ->
	pass = stdout.indexOf(expected) isnt -1
	if pass
		console.log 'THE ABOVE -->IS<-- WHAT WE EXPECTED. TESTS HAVE PASSED'
	else
		console.error 'THE ABOVE IS -->NOT<-- WHAT WE EXPECTED. TESTS HAVE FAILED'
	assert.ok(pass)

	# Test List Reporter
	stdout = ''
	runner = spawn('node', [everythingTestPath, '--joe-reporter=list'])
	runner.stdout.on 'data', (data) ->
		stdout += data
		process.stdout.write(data)
	runner.stderr.on 'data', (data) ->
		process.stderr.write(data)
	runner.on 'exit', (code) ->
		pass = stdout.indexOf(expected) isnt -1
		if pass
			console.log 'THE ABOVE -->IS<-- WHAT WE EXPECTED. TESTS HAVE PASSED'
		else
			console.log 'THE ABOVE IS -->NOT<-- WHAT WE EXPECTED. TESTS HAVE FAILED'
		assert.ok(pass)