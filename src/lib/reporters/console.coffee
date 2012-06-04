# Require
cliColor = require?('cli-color')

# Reporter
class ConsoleReporter
	errors: null
	config: null
	passed: 0
	failed: 0
	total: 0

	constructor: (config) ->
		@errors or= []
		@config or= config or {}
		@config.start ?= ''
		@config.fail ?= ' ✘  '
		@config.pass ?= ' ✔  '
		@config.sub ?= ' ➞  '
		@config.failHeading ?= 'Failure #%s:'
		@config.summaryPass ?= "#{@passed}/#{@total} tests ran successfully, everything passed"
		@config.summaryFail ?= "%s/%s tests ran successfully, %s failed"
		if cliColor?
			@config.fail = cliColor.red(@config.fail)
			@config.pass = cliColor.green(@config.pass)
			@config.sub = cliColor.gray(@config.sub)
			@config.failHeading = cliColor.red.underline(@config.failHeading)
			@config.summaryPass = cliColor.green.underline(@config.summaryPass)
			@config.summaryFail = cliColor.red.bold.underline(@config.summaryFail)

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
			console.log("\n"+@config.summaryPass, @passed, @total)
		else
			console.log("\n"+@config.summaryFail, @passed, @total, @errors.length)
			for error,index in @errors
				{suite,testName,err} = error
				testName = @getTestName(suite,testName)
				console.log("\n"+@config.failHeading, index+1)
				console.log("#{testName}\n#{err.stack.toString()}")
		console.log('')

# Export for node.js and browsers
if module? then (module.exports = ConsoleReporter) else (@joe.ConsoleReporter = ConsoleReporter)