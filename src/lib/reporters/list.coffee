# Require
ConsoleReporter = if require? then require(__dirname+'/console') else @joe.ConsoleReporter

# Reporter
class ListReporter extends ConsoleReporter

	startSuite: ->
	startTest: ->
	finishSuite: ->

	constructor: (config) ->
		@config or= config or {}
		@config.fail ?= '✘  '
		@config.pass ?= '✔  '
		super

	finishTest: (suite,testName,err) ->
		testName = @getTestName(suite,testName)
		return @  unless testName
		check = (if err then @config.fail else @config.pass)
		message = "#{check}#{testName}"
		console.log(message, if process? is false and err then [err,err.stack] else '')
		@

	exit: (exitCode) ->
		{totalTests,totalPassedTests,totalFailedTests,totalIncompleteTests,totalErrors} = @joe.getTotals()
		if exitCode
			errorLogs = @joe.getErrorLogs()
			console.log("\n"+@config.summaryFail, totalPassedTests, totalTests, totalFailedTests, totalIncompleteTests, totalErrors)
			for errorLog,index in errorLogs
				{suite,testName,err} = errorLog
				testName = @getTestName(suite,testName)
				console.log("\n"+@config.failHeading, index+1)
				console.log("#{testName}\n#{err.stack.toString()}")
		else
			console.log("\n"+@config.summaryPass, totalPassedTests, totalTests)
		console.log('')

# Export for node.js and browsers
if module? then (module.exports = ListReporter) else (@joe.ListReporter = ListReporter)