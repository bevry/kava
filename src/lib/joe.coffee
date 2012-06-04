# Require
balUtilFlow = if require? then require('bal-util/lib/flow') else @balUtilFlow
{Group} = balUtilFlow

# Reporter
class Reporter
	errors: null
	config: null
	passed: 0
	failed: 0
	total: 0

	constructor: (config) ->
		@errors or= []
		@config or= config or {}
		@config.start ?= ' '
		@config.fail ?= ' ✘ '
		@config.pass ?= ' ✔ '
		@config.sub ?= ' ➞  '

	getSuiteName: (suite) ->
		suiteName = suite.name
		if suite.parentSuite
			parentSuiteName = @getSuiteName(suite.parentSuite)
			suiteName = "#{parentSuiteName}#{@config.sub}#{suiteName}"
		return suiteName

	getTestName: (suite,testName) ->
		suiteName = @getSuiteName(suite)
		testName = "#{suiteName}#{@config.sub}#{testName}"
		return testName

	startSuite: (suite) ->
		suiteName = @getSuiteName(suite)
		message = "#{suiteName}#{@config.start}"
		console.log(message)

	finishSuite: (suite,err) ->
		suiteName = @getSuiteName(suite)
		check = (if err then @config.fail else @config.pass)
		message = "#{suiteName}#{check}"
		console.log(message)

	startTest: (suite,testName) ->
		++@total
		testName = @getTestName(suite,testName)
		message = "#{testName}#{@config.start}"
		console.log(message)

	finishTest: (suite,testName,err) ->
		if err
			@errors.push({suite,testName,err})
			++@failed
		else
			++@passed
		testName = @getTestName(suite,testName)
		check = (if err then @config.fail else @config.pass)
		message = "#{testName}#{check}"
		console.log(message, if process? is false and err then [err,err.stack] else '')

	exit: ->
		if @errors.length is 0
			console.log "\n#{@passed}/#{@total} tests ran successfully, everything passed"
		else
			console.log "\n#{@passed}/#{@total} tests ran successfully, #{@errors.length} failed"
			for error,index in @errors
				{suite,testName,err} = error
				testName = @getTestName(suite,testName)
				console.log("\nFailure \##{index+1}\n#{testName}\n#{err.stack.toString()}")

# Suite
class Suite extends Group

	# Create a new suite and run it
	# fn(suite.suite, suite.test, suite.exit)
	constructor: (name, fn, parentSuite) ->
		# Prepare the suite
		suite = @
		super (err) ->
			report('finishSuite',suite,err)
			suite.parentSuite?.complete(err)
		suite.name = name
		suite.parentSuite = parentSuite
		suite.mode = 'sync'

		# Fire the suite
		# If the suite has a compeletion callback,
		# then set our total tasks to infinity so we wait for the completion callback instead of the queue finishing
		report('startSuite',suite)
		suite.total = Infinity  if fn.length is 3
		fn(
			(name,fn) -> suite.suite(name,fn)
			(name,fn) -> suite.test(name,fn)
			(err) -> suite.exit(err)
		)
		if fn.length isnt 3
			suite.run()

	# Create a sub suite
	# fn(subSuite, subSuite.test, subSuite.exit)
	suite: (name,fn) ->
		# Push the creation of our subSuite to our suite's queue
		suite = @
		push = (complete) ->
			if suite.total is Infinity
				suite.pushAndRun(complete)
			else
				suite.push(complete)
		push ->
			subSuite = new Suite(name,fn,suite)
		@

	# Create a test for our current suite
	# fn(complete)
	test: (name,fn) ->
		# Push the firing of our test to our suite's queue
		suite = @
		push = (complete) ->
			if suite.total is Infinity
				suite.pushAndRun(complete)
			else
				suite.push(complete)
		push (complete) ->
			# Prepare
			preComplete = (err) ->
				report('finishTest',suite,name,err)
				complete(err)

			# Log
			report('startTest',suite,name)

			# If a callback was not specified, fire the funciton, and complete right away
			if fn.length < 1
				try
					fn()
					preComplete()
				catch err
					preComplete(err)
			# If a callback was specified, fire the function (user will call complete manually)
			else
				try
					fn(preComplete)
				catch err
					preComplete(err)
		@

# Prepare interface
createSuite = (args...) -> new Suite(args...)
report = (event, args...) ->
	for reporter in joe.reporters
		reporter[event].apply(reporter,args)
reporters = [new Reporter()]
joe = {Suite,Reporter,reporters,createSuite}
if process?
	process.on 'exit', -> report('exit')

# Create our interface globals
if global?
	global.describe = global.suite = createSuite
else
	@describe = @suite = createSuite

# Export for node.js and browsers
if module? then (module.exports = joe) else (@joe = joe)