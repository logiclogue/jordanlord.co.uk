var Metalsmith = require('metalsmith');
var collections = require('metalsmith-collections');
var layouts = require('metalsmith-layouts');
var markdown = require('metalsmith-markdown');
var permalinks = require('metalsmith-permalinks');
var templates = require('metalsmith-templates');
var pug = require('metalsmith-pug');


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
        engine: 'pug',
        directory: 'templates'
    }))
    //.use(pug({
    //    pretty: false
    //    //locals: {
    //    //    postName: 'good post name'
    //    //},
    //    //filters: {
    //    //    foo: block => block.replace('foo', 'bar')
    //    //}
    //}))
    .build(function (err) {
        if (err) {
            throw err;
        }
        else {
            console.log('Site build complete');
        }
    });
