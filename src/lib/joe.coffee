# Require
balUtil = if require? then require('bal-util') else @balUtilFlow
{Block} = balUtil

# Interface
joe =
	reporters: []
	errord: false
	exit: (err) ->
		# Report
		if err
			joe.errord = true
			unless err instanceof Error
				err = new Error(err)
			joe.report('uncaughtException',err)
		# Exit
		process.exit(if joe.errord then 1 else 0)
	report: (event, args...) ->
		if joe.reporters.length is 0
			joe.setDefaultReporter ->
				Reporter = require(__dirname+'/../lib/reporters/console')
				new Reporter()
		for reporter in joe.reporters
			reporter[event]?.apply(reporter,args)
	setDefaultReporter: (createReporter) ->
		if joe.reporters.length is 0
			joe.reporters.push createReporter()

# Suite
joe.Suite = class extends Block
	# Create a sub block
	createSubBlock: (name,fn,parentBlock) ->
		new joe.Suite(name,fn,parentBlock)

	# Events
	blockBefore: (block) ->
		joe.report('startSuite',block)
		super
	blockAfter: (block,err) ->
		joe.errord = true  if err
		joe.report('finishSuite',block,err)
		super
	blockTaskBefore: (block,test) ->
		joe.report('startTest',block,test)
		super
	blockTaskAfter: (block,test,err) ->
		joe.errord = true  if err
		joe.report('finishTest',block,test,err)
		super

	# Get the parent
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

# Joe Suite
joe.globalSuite = new joe.Suite('joe')

# Events
if process?
	process.on 'SIGINT', ->
		joe.exit()
	process.on 'exit', ->
		joe.report('exit')
	process.on 'uncaughtException', (err) ->
		joe.exit(err)

# Create our interface globals
joe.describe = joe.suite = (name,fn) ->
	joe.globalSuite.suite(name,fn)
joe.it = joe.test = (name,fn) ->
	joe.globalSuite.test(name,fn)

# Require helper
if require?
	joe.require = (path) ->
		require(__dirname+'/'+path)

# Export for node.js and browsers
if module? then (module.exports = joe) else (@joe = joe)