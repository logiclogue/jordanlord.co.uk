var Metalsmith = require('metalsmith');
var collections = require('metalsmith-collections');
var layouts = require('metalsmith-layouts');
var markdown = require('metalsmith-markdown');
var permalinks = require('metalsmith-permalinks');
var sass = require('metalsmith-sass');
var metadata = require('metalsmith-collection-metadata');


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
        blog: {
            pattern: '{blog/*.md, !index.js}',
            sortBy: 'date',
            reverse: true,
            metadata: {
                name: 'Blog'
            }
        },
        projects: {
            pattern: 'projects/*.md',
            sortBy: 'date',
            reverse: true,
            metadata: {
                name: 'Projects'
            }
        }
    }))
    .use(metadata({
        'collections.blog': {
            layout: 'default.pug'
        }
    }))
    .use(markdown())
    .use(permalinks({
        relative: false
    }))
    .use((files, metalsmith, done) => {
        var data = metalsmith._metadata;

        data.navbar = [
            {
                title: 'Project',
                path: 'project'
            },
            {
                title: 'Blog',
                path: 'blog'
            },
            {
                title: 'Home',
                path: ''
            }
        ];

        done();
    })
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
