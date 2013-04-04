# Import
ConsoleReporter = require('./console')

# Prepare
isWindows = process? and process.platform.indexOf('win') is 0

# Reporter
class ListReporter extends ConsoleReporter

	startSuite: ->
	startTest: ->
	finishSuite: ->

	constructor: (config) ->
		@config or= config or {}
		@config.fail ?= if isWindows then 'ERR! ' else '✘  '
		@config.pass ?= if isWindows then 'OK   ' else '✔  '
		super

	finishTest: (test,err) ->
		name = @getItemName(test)
		return @  unless name
		check = (if err then @config.fail else @config.pass)
		message = "#{check}#{name}"
		console.log(message, if process? is false and err then [err,err.stack] else '')
		@

	exit: (exitCode) ->
		{totalTests,totalPassedTests,totalFailedTests,totalIncompleteTests,totalErrors} = @joe.getTotals()
		if exitCode
			errorLogs = @joe.getErrorLogs()
			console.log("\n"+@config.summaryFail, totalPassedTests, totalTests, totalFailedTests, totalIncompleteTests, totalErrors)
			for errorLog,index in errorLogs
				{suite,test,err} = errorLog
				name = @getTestName(test or suite)
				console.log("\n"+@config.failHeading, index+1)
				console.log("#{name}\n#{err.stack.toString()}")
		else
			console.log("\n"+@config.summaryPass, totalPassedTests, totalTests)
		console.log('')

# Export
module.exports = ListReporter