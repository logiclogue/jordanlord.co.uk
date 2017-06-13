var Metalsmith = require('metalsmith');
var collections = require('metalsmith-collections');
var layouts = require('metalsmith-layouts');
var markdown = require('metalsmith-markdown');
var permalinks = require('metalsmith-permalinks');
var sass = require('metalsmith-sass');
var metadata = require('metalsmith-collection-metadata');
var highlight = require('metalsmith-metallic');
var feed = require('metalsmith-feed');
var githubReadme = require('./plugins/metalsmith-github-readme');
var config = require('./config.json');

config.siteMetadata.year = new Date().getFullYear();

Metalsmith(__dirname)
    .metadata(config.siteMetadata)
    .use((files, metalsmith, done) => {
        var metadata = metalsmith._metadata;

        metadata.site = {
            title: metadata.sitename,
            url: metadata.siteurl,
            author: metadata.sitename
        };

        done();
    })
    .use(githubReadme())
    .use(highlight())
    .use(sass(config.sass))
    .source('./src')
    .destination('./build')
    .clean(true)
    .use(collections(config.collections))
    .use(metadata(config.collectionMetadata))
    .use(markdown())
    .use(permalinks({
        relative: false
    }))
    .use(feed({
        collection: 'blog',
        postDescription: (file) => {
            file.date = file.publishDate;

            return file.contents;
        }
    }))
    .use((files, metalsmith, done) => {
        var data = metalsmith._metadata;

        data.navbar = config.navbar.reverse();
        data.months = config.months;

        done();
    })
    .use(layouts(config.layouts))
    .build((err) => {
        if (err) {
            throw err;
        }
        else {
            console.log('Site build complete');
        }
    });
