var Metalsmith = require('metalsmith');
var collections = require('metalsmith-collections');
var layouts = require('metalsmith-layouts');
var markdown = require('metalsmith-markdown');
var permalinks = require('metalsmith-permalinks');
var sass = require('metalsmith-sass');


Metalsmith(__dirname)
    .metadata({
        sitename: "JordanLord.co.uk",
        siteurl: "http://jordanlord.co.uk",
    })
    .use(sass({
        outputStyle: 'expanded',
        includePaths: ['styles']
    }))
    .source('./src')
    .destination('./build')
    .clean(true)
    .use(collections({
        posts: {
            pattern: 'posts/*.md',
            sortBy: 'date',
            reverse: true,
            metadata: {
                name: 'Posts'
            }
        }
    }))
    .use(markdown())
    .use(permalinks({
        relative: false
    }))
    .use(layouts({
        engine: 'pug',
        directory: 'templates'
    }))
    .build(function (err) {
        if (err) {
            throw err;
        }
        else {
            console.log('Site build complete');
        }
    });
