// define your test suite
require('./').describe('suite name', function(describe,it){
	// group together items into sub suites if you desire
	describe('sub suite name', function(describe,it){
		// create both synchronous and asynchronous tests
		it('synchronous test', function(){
			// do your stuff
		});
		it('asynchronous test name', function(complete){
			setTimeout(function(){
				// do your stuff
				complete();
			},500);
		});
	});
	// you can also define tests dynamically when using the completion callback on the group
	describe('lets create dynamic tests', function(describe,it,done){
		setTimeout(function(){
			it('a synchronous dynamic test',function(){
				// do your stuff
			});
			done();
		},500);
	});
});