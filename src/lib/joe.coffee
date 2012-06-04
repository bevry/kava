# Require
balUtilFlow = if require? then require('bal-util/lib/flow') else @balUtilFlow
{Group} = balUtilFlow

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
		reporter[event]?.apply(reporter,args)
reporters = []
joe = {Suite,reporters,createSuite}
if process?
	process.on 'exit', -> report('exit')

# Create our interface globals
if global?
	global.describe = global.suite = createSuite
else
	@describe = @suite = createSuite

# Export for node.js and browsers
if module? then (module.exports = joe) else (@joe = joe)