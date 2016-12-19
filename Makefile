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
	wget 'https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css'
	mv normalize.css $(DIR_LIB)
	mv skeleton.css $(DIR_LIB)
	mv font-awesome.min.css $(DIR_LIB)

git:
	git pull origin master

node_modules: package.json
	npm install

.PHONY: build
