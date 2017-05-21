var Metalsmith = require('metalsmith');
var collections = require('metalsmith-collections');
var layouts = require('metalsmith-layouts');
var markdown = require('metalsmith-markdown');
var permalinks = require('metalsmith-permalinks');
var sass = require('metalsmith-sass');
var metadata = require('metalsmith-collection-metadata');
var highlight = require('metalsmith-metallic');
var githubReadme = require('./plugins/metalsmith-github-readme');


Metalsmith(__dirname)
    .metadata({
        sitename: "Jordan Lord",
        siteurl: "http://jordanlord.co.uk",
        sitedescription: "['Programmer', 'Computer nerd', 'Unix enthusiast'];",
        year: new Date().getFullYear()
    })
    .use(githubReadme())
    .use(highlight())
    .use(sass({
        outputStyle: 'expanded',
        includePaths: ['styles']
    }))
    .source('./src')
    .destination('./build')
    .clean(true)
    .use(collections({
        blog: {
            pattern: 'blog/*.md',
            sortBy: 'publishDate',
            reverse: true,
            metadata: {
                name: 'Blog'
            }
        },
        projects: {
            pattern: 'projects/*.md',
            sortBy: 'publishDate',
            reverse: true,
            metadata: {
                name: 'Projects'
            }
        },
        misc: {
            sortBy: 'title'
        },
        retro_computers: {
            pattern: 'retro-computer-collection/*.md',
            reverse: true,
            metadata: {
                name: 'Retro Computer Collection'
            }
        }
    }))
    .use(metadata({
        'collections.blog': {
            layout: 'blog.pug'
        },
        'collections.projects': {
            layout: 'project.pug'
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
                title: 'Blog',
                path: 'blog'
            },
            {
                title: 'Projects',
                path: 'projects'
            },
            {
                title: 'Home',
                path: ''
            }
        ];

        data.months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ]

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
