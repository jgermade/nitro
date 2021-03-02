#!make
SHELL := env PATH=$(shell npm bin):$(PATH) /bin/bash

.PHONY: watch dist
.SILENT:

git_branch := $(shell git rev-parse --abbrev-ref HEAD)

ifndef FORCE_COLOR
  export FORCE_COLOR=true
endif

ifndef NPM_VERSION
  export NPM_VERSION=patch
endif

node_modules:; npm install
install:; npm install
i: install

lint: node_modules
	eslint 'src/{,**/}*.{js,ts}'

unit-tests: node_modules
	jest

test: lint unit-tests

transpile: src/**/*.ts
transpile: src/*.ts
	$(MAKE) node_modules

	for file in $^ ; do \
		if [[ ! $$file =~ .spec.ts$$ ]]; then \
			_file="$${file//src\//}"; \
			echo "bundling: $${file} -> dist/$${_file%.*}.js"; \
			esbuild $${file} --outfile=dist/$${_file%.*}.js --format=cjs --target=node10; \
			echo "bundling: $${file} -> dist/$${_file%.*}.es6"; \
			esbuild $${file} --outfile=dist/$${_file%.*}.es6 --format=esm --target=es2020; \
		fi \
	done

typescript.declarations:
	echo "generating typescript declarations"; \
	tsc src/*.ts --outDir dist \
		--declaration \
		--allowJs \
		--emitDeclarationOnly \
		--esModuleInterop

dist:
	mkdir -p dist
	$(MAKE) transpile
	cp -r cli dist
	cp package.json dist

build: dist typescript.declarations

publish:
	git pull origin $(git_branch) --tags
	npm version ${NPM_VERSION}
	git push origin $(git_branch) --tags
	npm publish --access public
