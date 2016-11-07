var Metalsmith = require('metalsmith');
var collections = require('metalsmith-collections');
var layouts = require('metalsmith-layouts');
var markdown = require('metalsmith-markdown');
var permalinks = require('metalsmith-permalinks');


Metalsmith(__dirname)
    .metadata({
        sitename: "JordanLord.co.uk",
        siteurl: "http://jordanlord.co.uk",
    })
    .source('./src')
    .destination('./build')
    .clean(true)
    .use(collections({
        posts: 'posts/*.md'
    }))
    .use(markdown())
    .use(permalinks({
        relative: false
    }))
    .use(layouts({
        engine: 'handlebars',
        partials: './layouts/partials'
    }))
    .build(function (err) {
        if (err) {
            throw err;
        }
    });
