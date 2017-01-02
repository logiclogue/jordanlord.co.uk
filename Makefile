DIR_LIB = lib


all: install build

build: node_modules
	node index.js

install: git node_modules css

css:
	mkdir -p $(DIR_LIB)
	cd $(DIR_LIB)
	wget 'https://raw.githubusercontent.com/dhg/Skeleton/88f03612b05f093e3f235ced77cf89d3a8fcf846/css/normalize.css'
	wget 'https://raw.githubusercontent.com/dhg/Skeleton/88f03612b05f093e3f235ced77cf89d3a8fcf846/css/skeleton.css'
	wget 'https://raw.githubusercontent.com/isagalaev/highlight.js/44b2e46196ac633b82b69ebf389c9bcf213941fc/src/styles/monokai-sublime.css'
	mv normalize.css $(DIR_LIB)
	mv skeleton.css $(DIR_LIB)
	mv monokai-sublime.css $(DIR_LIB)/code-theme.css

git:
	git pull origin master

node_modules: package.json
	npm install

.PHONY: build
