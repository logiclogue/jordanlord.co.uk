const Metalsmith = require("metalsmith");
const collections = require("metalsmith-collections");
const layouts = require("metalsmith-layouts");
const markdown = require("metalsmith-markdown");
const permalinks = require("metalsmith-permalinks");
const metadata = require("metalsmith-collection-metadata");
const highlight = require("metalsmith-metallic");
const feed = require("metalsmith-feed");
const drafts = require("@metalsmith/drafts");
const assets = require("metalsmith-assets");
const githubReadme = require("./plugins/metalsmith-github-readme");
const rootPath = require("./plugins/rootPath");
const sass = require("./plugins/metalsmith-sass");
const config = require("./config.json");

config.siteMetadata.year = new Date().getFullYear();

Metalsmith(__dirname)
    .metadata(config.siteMetadata)
    .use((files, metalsmith, done) => {
        let metadata = metalsmith._metadata;

        metadata.rootPath = rootPath;

        metadata.site = {
            title: metadata.sitename,
            url: metadata.siteurl,
            author: metadata.sitename
        };

        done();
    })
    .use(assets({
        source: "./res",
        destination: "./res"
    }))
    .use(drafts())
    .use(githubReadme())
    .use(highlight())
    .use(sass(config.sass))
    .source("./src")
    .destination("./build")
    .clean(true)
    .use(collections(config.collections))
    .use(metadata(config.collectionMetadata))
    .use(markdown())
    .use(permalinks({
        relative: false
    }))
    .use(feed({
        collection: "blog",
        postDescription: (file) => {
            file.date = file.publishDate;

            return file.contents;
        }
    }))
    .use((files, metalsmith, done) => {
        let data = metalsmith._metadata;

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
            console.log("Site build complete");
        }
    });
