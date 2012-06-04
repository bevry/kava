# Require
ConsoleReporter = if require? then require(__dirname+'/console') else @joe.ConsoleReporter

# Reporter
class ListReporter extends ConsoleReporter

	startSuite: ->
	finishSuite: ->
	startTest: -> ++@total

	constructor: (config) ->
		@config or= config or {}
		@config.fail ?= '✘  '
		@config.pass ?= '✔  '
		super

	finishTest: (suite,testName,err) ->
		if err
			@errors.push({suite,testName,err})
			++@failed
		else
			++@passed
		testName = @getTestName(suite,testName)
		check = (if err then @config.fail else @config.pass)
		message = "#{check}#{testName}"
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
if module? then (module.exports = ListReporter) else (@joe.ListReporter = ListReporter)