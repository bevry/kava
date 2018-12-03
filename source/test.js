'use strict'

require('./reporters/console/test.js').done(() =>
	require('./reporters/list/test.js')
)
