compile:
	./node_modules/.bin/coffee -o out/ -c src/

dev:
	./node_modules/.bin/coffee -w -o out/ -c src/

test:
	make compile
	npm test

example-run:
	make compile
	node out/example/example1.test.js
	node out/example/everything.test.js
	node out/example/fail-throw-suite.test.js
	node out/example/fail-usage-suite.test.js
	node out/example/fail-usage-test.test.js
	node out/example/fail-never-finish.test.js

example:
	make example-run -i

.PHONY: compile dev test example example-run