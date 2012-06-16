compile:
	./node_modules/.bin/coffee -o out/ -c src/

dev:
	./node_modules/.bin/coffee -w -o out/ -c src/

example:
	node out/example/example1.test.js &
	node out/example/everything.test.js &
	node out/example/usage-warning-suite.test.js &
	node out/example/usage-warning-test.test.js &

.PHONY: compile dev example