# Require
balUtilFlow = require?('bal-util') or @balUtilFlow
{Block} = balUtilFlow

# Config
# Some configuration specific to joe
config =

	# Teroubleshooting URL
	# A url used to refer people when a joe specific error is thrown
	troubleshootingURL: 'https://github.com/bevry/joe/wiki/Troubleshooting'


# Suite
# A suite is the heart of Joe, they extend the bal-util Block class
# The Block class provides us with all the logic we need:
# - a way to group sync/async tasks, and execute them in a parallel or serial fashion
# - if a task fails, then we will exit the group of tasks and return the error in the completion callback for the group
# With suites, we extend this functionality with:
# - creating blocks through `suite` and `describe` functions
# - creating tasks through `test` and `it` functions
# - when tasks start and finish, we log their errors (if any) and the counts (how many started, how many finished, how many failed)
Suite = class extends Block
	# When we create a sub block, create it using our Suite class instead of the standard Block
	createSubBlock: (opts) ->
		opts.parentBlock = @
		new Suite(opts)

	# Override the Block events with our own handlers, so we can trigger our reporting events
	blockBefore: (suite) ->
		joePrivate.totalSuites++
		joe.report('startSuite',suite)
		super
	blockAfter: (suite,err) ->
		if err
			joePrivate.addErrorLog({suite,err})
			joePrivate.totalFailedSuites++
		else
			joePrivate.totalPassedSuites++
		joe.report('finishSuite',suite,err)
		super
	blockTaskBefore: (suite,testName) ->
		joePrivate.totalTests++
		joe.report('startTest',suite,testName)
		super
	blockTaskAfter: (suite,testName,err) ->
		if err
			joePrivate.addErrorLog({suite,testName,err})
			joePrivate.totalFailedTests++
		else
			joePrivate.totalPassedTests++
		joe.report('finishTest',suite,testName,err)
		super

	# Provide an API that can be used by our reporters
	getSuiteName: -> @blockName
	getParentSuite: -> @parentBlock

	# Aliases for new block
	# fn(subSuite, subSuite.test, subSuite.exit)
	suite: (name,fn) ->
		unless fn.length in [0,2,3]
			throw new Error("An invalid amount of arguments were specified for a Joe Suite, more info here: #{config.troubleshootingURL}")
		else
			@block(name,fn)
	describe: (name,fn) ->
		@suite(name,fn)

	# Sliases for new task
	# fn(complete)
	test: (name,fn) ->
		unless fn.length in [0,1]
			throw new Error("An invalid amount of arguments were specified for a Joe Test, more info here: #{config.troubleshootingURL}")
		else
			@task(name,fn)
	it: (name,fn) ->
		@test(name,fn)


# Creare out private interface for Joe
# The reason we have a public and private interface for joe is that we do not want tests being able to modify the test results
# As such, the private interface contains properties that must be mutable by the public interface, but not mutable by the bad tests
joePrivate =

	# Global Suite
	# We use a global suite to contain all of the Suite suites and joe.test tests
	globalSuite: null

	# Get Global Suite
	# We have a getter for the global suite to create it when it is actually needed
	getGlobalSuite: ->
		# If it doesn't exist, then create it and name it joe
		unless joePrivate.globalSuite?
			joePrivate.globalSuite = new Suite({name:'joe'})

		# Return the global suite
		return joePrivate.globalSuite

	# Error Logs
	# We log all the errors that have occured with their suite and testName
	# so the reporters can access them
	errorLogs: [] # [{err,suite,testName}]

	# Add Error Log
	# Logs an error into the errors array, however only if we haven't already logged it
	# log = {err,suite,testName}
	addErrorLog: (errorLog) ->
		if errorLog.err is joePrivate.errorLogs[joePrivate.errorLogs.length-1]?.err
			# ignore
		else
			joePrivate.errorLogs.push(errorLog)
		return joePrivate

	# Exited?
	# Whether or not joe has already exited, either via error or via finishing everything it is meant to be doing
	# We store this flag, as we do not want to exit multiple times if we have multiple errors or exit signals
	exited: false

	# Reports
	# This is a listing of all the reporters we will be using
	# Reporters are what output the results of our tests/suites to the user (Joe just runs them)
	reporters: []

	# Totals
	# Here are a bunch of totals we use to calculate our progress
	# They are mostly used by reporters, however we do use them to figure out if joe was successful or not
	totalSuites: 0
	totalPassedSuites: 0
	totalFailedSuites: 0
	totalTests: 0
	totalPassedTests: 0
	totalFailedTests: 0

	# Get Reporters
	# Fetches our reporters when we need them, if none are set,
	# then we fetch the reporter specified by the CLI arguments (if running in the CL), or the default reporter for the environment
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

				# Load our default reporter
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
		return joePrivate.reporters


# Create the interface for Joe
joe =
	# Get Totals
	# Fetches all the different types of totals we have collected
	# and determines the incomplete suites and tasks
	# as well as whether or not everything has succeeded correctly (no incomplete, no failures, no errors)
	getTotals: ->
		# Fetch
		{totalSuites,totalPassedSuites,totalFailedSuites,totalTests,totalPassedTests,totalFailedTests,errorLogs} = joePrivate

		# Calculate
		totalIncompleteSuites = totalSuites - totalPassedSuites - totalFailedSuites
		totalIncompleteTests = totalTests - totalPassedTests - totalFailedTests
		totalErrors = errorLogs.length
		success = (totalIncompleteSuites is 0) and (totalFailedSuites is 0) and (totalIncompleteTests is 0) and (totalFailedTests is 0) and (totalErrors is 0)

		# Return
		result = {totalSuites,totalPassedSuites,totalFailedSuites,totalIncompleteSuites,totalTests,totalPassedTests,totalFailedTests,totalIncompleteTests,totalErrors,success}
		return result

	# Get Errors
	# Returns a cloned array of all the error logs
	getErrorLogs: ->
		joePrivate.errorLogs.slice()

	# Has Errors
	# Returns false if there were no incomplete, no failures and no errors
	hasErrors: ->
		joe.getTotals().success is false

	# Has Exited
	# Returns true if we have exited already
	# we do not want to exit multiple times
	hasExited: ->
		joePrivate.exited is true

	# Has Reportes
	# Do we have any reporters yet?
	hasReporters: ->
		joePrivate.reporters isnt 0

	# Add Reporter
	# Add a reporter to the list of reporters we will be using
	addReporter: (reporterInstance) ->
		reporterInstance.joe = joe
		joePrivate.reporters.push(reporterInstance)
		joe

	# Set Reporter
	# Clear all the other reporters we may be using, and just use this one
	setReporter: (reporterInstance) ->
		joePrivate.reporters = []
		joe.addReporter(reporterInstance)  if reporterInstance?
		joe

	# Report
	# Report and event to our reporters
	report: (event, args...) ->
		# Fetch the reporters
		reporters = joePrivate.getReporters()

		# Check we have reporters
		unless reporters.length
			console.log("Joe has no reporters loaded, so cannot log anything...")
			joe.exit(1)
			return joe

		# Cycle through the reporters
		for reporter in reporters
			reporter[event]?.apply(reporter,args)

		# Chain
		joe

	# Exit
	# Exit our process with the specifeid exitCode
	# If no exitCode is set, then we determine it through the hasErrors call
	exit: (exitCode) ->
		# Check
		return  if joe.exited
		joePrivate.exited = true

		# Determine exit code
		unless exitCode?
			exitCode = if joe.hasErrors() then 1 else 0

		# Report our exit
		joe.report('exit', exitCode)

		# Kill our process with the correct exit code
		if process?
			process.exit(exitCode)

		# Chain
		joe

	# Uncaught Exception
	# Log an uncaughtException and die
	uncaughtException: (err) ->
		# Check
		return  if joe.hasExited()

		# Report
		unless err instanceof Error
			err = new Error(err)
		joePrivate.addErrorLog({testName:'uncaughtException',err})
		joe.report('uncaughtException',err)
		joe.exit(1)

		# Chain
		joe

	# Get Suite Name
	# Get a suite's entire name, including the parent suites (if separator is specified)
	getSuiteName: (suite,separator) ->
		# Prepare
		suiteName = suite.getSuiteName()
		result = suiteName

		# Should we get the parent suite names as well?
		if separator
			parentSuite = suite.getParentSuite()
			if parentSuite
				parentSuiteName = joe.getSuiteName(parentSuite,separator)
				result = ''
				result += "#{parentSuiteName}#{separator}"  if parentSuiteName
				result += "#{suiteName}"

		# Return the result name
		return result

	# Get Test Name
	# Get a test's entire name, including the parent suites (if separator is specified)
	getTestName: (suite,testName,separator) ->
		# Prepare
		result = testName

		# Should we get the suite names as well?
		if separator and suite?
			suiteName = joe.getSuiteName(suite,separator)
			result = ''
			result += "#{suiteName}"
			result += "#{separator}#{testName}"  if testName

		# Return the result name
		return result

# Events
# Hook into all the different ways a process can die
# and handle appropriatly
if process?
	process.on 'SIGINT', ->
		joe.exit()  unless joe.hasExited()
	process.on 'exit', ->
		joePrivate.getGlobalSuite().exit()
		joe.exit()  unless joe.hasExited()
	process.on 'uncaughtException', (err) ->
		joe.uncaughtException(err)  unless joe.hasExited()

# Interface
# Create our public interface for creating suites and tests
joe.describe = joe.suite = (name,fn) ->
	joePrivate.getGlobalSuite().suite(name,fn)
joe.it = joe.test = (name,fn) ->
	joePrivate.getGlobalSuite().test(name,fn)

# Require helper
# Helps node processes include their desired reporter
if require?
	joe.require = (path) -> require(__dirname+'/'+path)

# Freeze our public interface from changes
# This should only work on node, as we use the joe interface to insert our reporters when inside browsers
if require?
	Object.freeze?(joe)

# Export for node.js and browsers
if module? then (module.exports = joe) else (@joe = joe)