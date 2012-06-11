# Require
balUtilFlow = require?('bal-util') or @balUtilFlow
{Block} = balUtilFlow

# Creare out private interface for Joe
joePrivate =

	# Store our Global Suite that will run your own Suites
	globalSuite: null

	# Define a getter for the Global Suite
	getGlobalSuite: ->
		# If it doesn't exist, then create it and name it joe
		unless joePrivate.globalSuite?
			joePrivate.globalSuite = new joe.Suite('joe')
		# Return the global suite
		joePrivate.globalSuite

	# Has joe ever encountered an error?
	errord: false

	# Has joe already exited?
	exited: false

	# Store our reporters that we will use to output the success/failure of our tests
	reporters: []

	# Define a getter for our Reporters
	getReporters: ->
		# Check if have no reporters
		if joePrivate.reporters.length is 0
			# Load the default reporter in node
			if process?.argv and require?
				# Prepare
				defaultReporter = 'console'

				# Cycle through our CLI arguments
				# to see if we can override our defaultReporter with one specified by the CLI
				for arg in process.argv
					# Do we have our --joe-reporter=REPORTER argument?
					argResult = arg.replace(/^--joe-reporter=/,'')
					if argResult isnt arg
						defaultReporter = argResult
						break

				# Load our defualt reporter
				try
					Reporter = joe.require("reporters/#{defaultReporter}")
					joe.addReporter(new Reporter())
				catch err
					console.log("Joe could not load the reporter: #{defaultReporter}. The error is as follows:\n", err)
					joe.exit(1)

			# Load the default reporter in th browser
			else
				try
					Reporter = joe.ConsoleReporter
					joe.addReporter(new Reporter())
				catch err
					console.log("Joe could not load the reporter: #{defaultReporter}. The error is as follows:\n", err)
					joe.exit(1)

		# Return our reporters
		joePrivate.reporters

# Create the interface for Joe
joe =
	# Has joe errord?
	hasErrors: ->
		joePrivate.errord is true

	# Has joe exited?
	hasExited: ->
		joePrivate.exited is true

	# Has joe got reporters?
	hasReporters: ->
		joePrivate.reporters isnt 0

	# Add a reporter to our list of reporters
	addReporter: (reporterInstance) ->
		joePrivate.reporters.push(reporterInstance)
		@

	# Clear our existing reporters and use only this one
	setReporter: (reporterInstance) ->
		joePrivate.reporters = []
		joe.addReporter(reporterInstance)  if reporterInstance?
		@

	# Reporter a message to our
	report: (event, args...) ->
		# Fetch the reporters
		reporters = joePrivate.getReporters()

		# Check we have reporters
		unless reporters.length
			console.log("Joe has no reporters loaded, so cannot log anything...")
			joe.exit(1)
			return @

		# Cycle through the reporters
		for reporter in reporters
			reporter[event]?.apply(reporter,args)

		# Chain
		@

	# Exit our process with the specifeid exit code
	exit: (exitCode) ->
		# Check
		return  if joe.exited
		joePrivate.exited = true

		# Report our exit
		joe.report('exit')

		# Kill our process with the correct exit code
		if process?
			exitCode ?= if joe.hasErrors() then 1 else 0
			process.exit(exitCode)

		# Chain
		@

	# Log an uncaughtException and die
	uncaughtException: (err) ->
		# Check
		return  if joe.hasExited()

		# Report
		joePrivate.errord = true
		unless err instanceof Error
			err = new Error(err)
		joe.report('uncaughtException',err)
		joe.exit(1)

		# Chain
		@

	# Suite
	# Extend the bal-util Block class with our testing stuff
	Suite: class extends Block
		# When we create a sub block, create it using our Suite instead of the standard Block
		createSubBlock: (name,fn,parentBlock) ->
			new joe.Suite(name,fn,parentBlock)

		# Override the Block events with our own handlers, so we can trigger our reporting events
		blockBefore: (block) ->
			joe.report('startSuite',block)
			super
		blockAfter: (block,err) ->
			joePrivate.errord = true  if err
			joe.report('finishSuite',block,err)
			super
		blockTaskBefore: (block,test) ->
			joe.report('startTest',block,test)
			super
		blockTaskAfter: (block,test,err) ->
			joePrivate.errord = true  if err
			joe.report('finishTest',block,test,err)
			super

		# Provide an API that can be used by our reporters and whatnot
		getSuiteName: ->
			@blockName
		getParentSuite: ->
			@parentBlock

		# Testing aliases for new block
		# fn(subSuite, subSuite.test, subSuite.exit)
		suite: (name,fn) ->
			@block(name,fn)
		describe: (name,fn) ->
			@block(name,fn)

		# Testing aliases for new task
		# fn(complete)
		test: (name,fn) ->
			@task(name,fn)
		it: (name,fn) ->
			@task(name,fn)


# Events
if process?
	process.on 'SIGINT', ->
		joe.exit()  unless joe.hasExited()
	process.on 'exit', ->
		joe.exit()  unless joe.hasExited()
	process.on 'uncaughtException', (err) ->
		joe.uncaughtException(err)  unless joe.hasExited()

# Create our interface globals to be used by others
joe.describe = joe.suite = (name,fn) ->
	joePrivate.getGlobalSuite().suite(name,fn)
joe.it = joe.test = (name,fn) ->
	joePrivate.getGlobalSuite().test(name,fn)

# Require helper
if require?
	joe.require = (path) ->
		require(__dirname+'/'+path)

# Freeze our public interface from changes
# This should only work on node, as we use the joe interface to insert our reporters when inside browsers
if require?
	Object.freeze?(joe)

# Export for node.js and browsers
if module? then (module.exports = joe) else (@joe = joe)