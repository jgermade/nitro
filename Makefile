# --- nitro-js

npmdir = $(shell npm bin)
whoami = $(shell whoami)

# TASKS

install:
	npm install
	@./nitro build

auto.install:
	@./auto-install

test: auto.install
	@$(npmdir)/mocha tests

echo:
	@echo "hi all!"

# DEFAULT TASKS

.DEFAULT_GOAL := echo
