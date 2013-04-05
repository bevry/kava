# Import
{TaskGroup} = require('taskgroup')

# Prepare
isBrowser = window?
isWindows = process?.platform?.indexOf('win') is 0

# Suite
Suite = class extends TaskGroup
	constructor: ->
		# Prepare
		super

		# Group Before
		@on 'group.run', (suite) ->
			return  unless suite.name
			joePrivate.totalSuites++
			joe.report('startSuite',suite)

		# Group After
		@on 'group.complete', (suite,err) ->
			if err
				joePrivate.addErrorLog({suite,err})
				return  unless suite.name
				joePrivate.totalFailedSuites++
			else
				return  unless suite.name
				joePrivate.totalPassedSuites++
			joe.report('finishSuite',suite,err)

		# Task Before
		@on 'task.run', (test) ->
			return  unless test.name
			joePrivate.totalTests++
			joe.report('startTest',test)

		# Task After
		@on 'task.complete', (test,err) ->
			if err
				joePrivate.addErrorLog({test,err})
				return  unless test.name
				joePrivate.totalFailedTests++
			else
				return  unless test.name
				joePrivate.totalPassedTests++
			joe.report('finishTest',test,err)

	createGroup: (args...) =>
		group = new Suite(args...)
		return group

	suite: (args...) => @addGroup(args...)
	describe: (args...) => @addGroup(args...)

	test: (args...) => @addTask(args...)
	it: (args...) => @addTask(args...)


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
			joePrivate.globalSuite = new Suite().run()

		# Return the global suite
		return joePrivate.globalSuite

	# Error Logs
	# We log all the errors that have occured with their suite and test
	# so the reporters can access them
	errorLogs: [] # [{err,suite,test,name}]

	# Add Error Log
	# Logs an error into the errors array, however only if we haven't already logged it
	# log = {err,suite,test,name}
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
			# Prepare
			reporterName = 'console'

			# Cycle through our CLI arguments
			# to see if we can override our reporterName with one specified by the CLI
			for arg in (process?.argv or [])
				# Do we have our --joe-reporter=REPORTER argument?
				argResult = arg.replace(/^--joe-reporter=/,'')
				if argResult isnt arg
					reporterName = argResult
					break

			# Load our default reporter
			try
				joe.addReporter(reporterName)
			catch err
				console.log("""
					Joe could not load the reporter: #{reporterName}
					Perhaps it's not installed? Try install it using:
					    npm install --save-dev joe-reporter-#{reporterName}
					The exact error was:
					""", err
				)
				joe.exit(1)
				return

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
		return joePrivate.errorLogs.slice()

	# Has Errors
	# Returns false if there were no incomplete, no failures and no errors
	hasErrors: ->
		return joe.getTotals().success is false

	# Has Exited
	# Returns true if we have exited already
	# we do not want to exit multiple times
	hasExited: ->
		return joePrivate.exited is true

	# Has Reportes
	# Do we have any reporters yet?
	hasReporters: ->
		return joePrivate.reporters isnt 0

	# Add Reporter
	# Add a reporter to the list of reporters we will be using
	addReporter: (reporterInstance) ->
		# Load the reporter
		if typeof reporterInstance is 'string'
			Reporter = require("joe-reporter-#{reporterInstance}")
			reporterInstance = new Reporter()

		# Add joe to the reporter
		reporterInstance.joe = joe

		# Add the reporter to the list of reporters we have
		joePrivate.reporters.push(reporterInstance)

		# Chain
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
		return  if joe.hasExited()
		joePrivate.exited = true

		# Stop
		joePrivate.getGlobalSuite().stop()

		# Determine exit code
		unless exitCode?
			exitCode = if joe.hasErrors() then 1 else 0

		# Report our exit
		joe.report('exit', exitCode)

		# Kill our process with the correct exit code
		process?.exit?(exitCode)

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
		joePrivate.addErrorLog({name:'uncaughtException',err})
		joe.report('uncaughtException',err)
		joe.exit(1)

		# Chain
		joe

	# Get Item Names
	getItemNames: (item) ->
		result = []
		result = result.concat(@getItemNames(item.parent))  if item.parent
		result.push(item.name)  if item.name
		return result

	# Get Item Name
	getItemName: (item,separator) ->
		if separator
			result = joe.getItemNames(item).join(separator)
		else
			result = item.name
		return result

# Events
# Hook into all the different ways a process can die
# and handle appropriatly
if isBrowser
	joePrivate.getGlobalSuite().on 'item.complete', (item) ->
		return  unless item.name
		joePrivate.getGlobalSuite().on 'complete', ->
			process.nextTick -> joe.exit()

else if process?
	unless isWindows
		process.on 'SIGINT', -> joe.exit()
	process.on 'exit', -> joe.exit()
	process.on 'uncaughtException', (err) -> joe.uncaughtException(err)

# Interface
# Create our public interface for creating suites and tests
joe.describe = joe.suite = (name,fn) ->
	joePrivate.getGlobalSuite().suite(name,fn)
joe.it = joe.test = (name,fn) ->
	joePrivate.getGlobalSuite().test(name,fn)

# Freeze our public interface from changes
Object.freeze?(joe)  if !isBrowser

# Export
module.exports = joe