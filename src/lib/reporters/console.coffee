# Prepare
isBrowser = window?
isWindows = process? and process.platform.indexOf('win') is 0

# Optional
try
	cliColor = require('cli-color')  unless isBrowser
catch err
	cliColor = null

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

	getItemName: (item) ->
		name = @joe.getItemName(item,@config.sub)
		return name

	startSuite: (suite) ->
		name = @getItemName(suite)
		return @  unless name
		message = "#{name}#{@config.start}"
		console.log(message)
		@

	finishSuite: (suite,err) ->
		name = @getItemName(suite)
		return @  unless name
		check = (if err then @config.fail else @config.pass)
		message = "#{name}#{check}"
		console.log(message)
		@

	startTest: (test) ->
		name = @getItemName(test)
		return @  unless name
		message = "#{name}#{@config.start}"
		console.log(message)
		@

	finishTest: (test,err) ->
		name = @getItemName(test)
		return @  unless name
		check = (if err then @config.fail else @config.pass)
		message = "#{name}#{check}"
		console.log(message, if process? is false and err then [err,err.stack] else '')
		@

	exit: (exitCode) ->
		{totalTests,totalPassedTests,totalFailedTests,totalIncompleteTests,totalErrors} = @joe.getTotals()
		if exitCode
			errorLogs = @joe.getErrorLogs()
			console.log("\n"+@config.summaryFail, totalPassedTests, totalTests, totalFailedTests, totalIncompleteTests, totalErrors)
			for errorLog,index in errorLogs
				{suite,test,name,err} = errorLog
				name or= @getItemName(test or suite)
				console.log("\n"+@config.failHeading, index+1)
				console.log(name)
				console.log(err.stack?.toString() or err)
			console.log('')
		else
			console.log("\n"+@config.summaryPass, totalPassedTests, totalTests)
		@

# Export
module.exports = ConsoleReporter