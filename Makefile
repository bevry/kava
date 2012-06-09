# If you change something here, be sure to change it in package.json's scripts as well

dev:
	./node_modules/.bin/coffee -w -o out/ -c src/

compile:
	./node_modules/.bin/coffee -o out/ -c src/

example:
	node out/example/example1.test.js
	node out/example/everything.test.js

.PHONY: dev compile