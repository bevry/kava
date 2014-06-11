# Requires
{spawn} = require('child_process')

# Prepare
everythingTestPath = __dirname+'/../example/example1.js'
expectedCount = "13/16 tests ran successfully; 3 failed, 0 incomplete, 3 errors"
expectedError = 'deliberate error'

# Test Default Reporter
output = ''
runner = spawn('node', [everythingTestPath])
runner.stdout.on 'data', (data) ->
	output += data
	process.stdout.write(data)
runner.stderr.on 'data', (data) ->
	output += data
	process.stderr.write(data)
runner.on 'exit', (code) ->
	fail = output.indexOf(expectedCount) is -1 or output.indexOf(expectedError) is -1
	if fail is false
		console.log 'THE ABOVE -->IS<-- WHAT WE EXPECTED. TESTS HAVE PASSED'
	else
		console.error 'THE ABOVE IS -->NOT<-- WHAT WE EXPECTED. TESTS HAVE FAILED'
		process.exit(1)

	# Test List Reporter
	output = ''
	runner = spawn('node', [everythingTestPath, '--joe-reporter=list'])
	runner.stdout.on 'data', (data) ->
		output += data
		process.stdout.write(data)
	runner.stderr.on 'data', (data) ->
		output += data
		process.stderr.write(data)
	runner.on 'exit', (code) ->
		fail = output.indexOf(expectedCount) is -1 or output.indexOf(expectedError) is -1
		if fail is false
			console.log 'THE ABOVE -->IS<-- WHAT WE EXPECTED. TESTS HAVE PASSED'
		else
			console.log 'THE ABOVE IS -->NOT<-- WHAT WE EXPECTED. TESTS HAVE FAILED'
			process.exit(1)