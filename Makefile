install: install-deps

develop:
	npm run webpack serve

install-deps:
	npm install

build:
	rm -rf dist
	NODE_ENV=production npm run webpack

test:
	npm test

lint:
	npx eslint .

publish:
	npm publish

format:
	npx prettier --write .

.PHONY: test