# Optional
try
	cliColor = require?('cli-color')
catch err
	cliColor = null

# Prepare
isWindows = process? and process.platform.indexOf('win') is 0

# Reporter
class ConsoleReporter
	errors: null
	config: null

	constructor: (config) ->
		@errors or= []
		@config or= config or {}
		@config.start ?= ''
		@config.fail ?= if isWindows then ' ERR!' else ' ✘  '
		@config.pass ?= if isWindows then ' OK' else ' ✔  '
		@config.sub ?= if isWindows then ' > ' else ' ➞  '
		@config.failHeading ?= 'Error #%s:'
		@config.summaryPass ?= "%s/%s tests ran successfully, everything passed"
		@config.summaryFail ?= "FAILURE: %s/%s tests ran successfully; %s failed, %s incomplete, %s errors"
		if cliColor?
			unless '--no-colors' in process?.argv
				@config.fail = cliColor.red(@config.fail)
				@config.pass = cliColor.green(@config.pass)
				@config.sub = cliColor.black(@config.sub)
				@config.failHeading = cliColor.red.underline(@config.failHeading)
				@config.summaryPass = cliColor.green.underline(@config.summaryPass)
				@config.summaryFail = cliColor.red.bold.underline(@config.summaryFail)

	getSuiteName: (suite) ->
		return @joe.getSuiteName(suite,@config.sub)

	getTestName: (suite,testName) ->
		result = ''
		if suite?
			suiteName = @getSuiteName(suite)
			result += "#{suiteName}"
			result += "#{@config.sub}#{testName}"  if testName
		else
			result = testName
		return result

	startSuite: (suite) ->
		suiteName = @getSuiteName(suite)
		return @  unless suiteName
		message = "#{suiteName}#{@config.start}"
		console.log(message)
		@

	finishSuite: (suite,err) ->
		suiteName = @getSuiteName(suite)
		return @  unless suiteName
		check = (if err then @config.fail else @config.pass)
		message = "#{suiteName}#{check}"
		console.log(message)
		@

	startTest: (suite,testName) ->
		testName = @getTestName(suite,testName)
		return @  unless testName
		message = "#{testName}#{@config.start}"
		console.log(message)
		@

	finishTest: (suite,testName,err) ->
		testName = @getTestName(suite,testName)
		return @  unless testName
		check = (if err then @config.fail else @config.pass)
		message = "#{testName}#{check}"
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
				console.log(testName)
				console.log(err.stack?.toString() or err)
			console.log('')
		else
			console.log("\n"+@config.summaryPass, totalPassedTests, totalTests)
		@

# Export for node.js and browsers
if module? then (module.exports = ConsoleReporter) else (@joe.ConsoleReporter = ConsoleReporter)