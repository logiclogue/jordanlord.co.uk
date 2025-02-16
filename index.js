import Metalsmith from "metalsmith";
import collections from "metalsmith-collections";
import layouts from "metalsmith-layouts";
import markdown from "metalsmith-markdown";
import permalinks from "metalsmith-permalinks";
import metadata from "metalsmith-collection-metadata";
import highlight from "metalsmith-metallic";
import feed from "metalsmith-feed";
import drafts from "@metalsmith/drafts";
import assets from "metalsmith-assets";
import shortcodes from "./plugins/metalsmith-shortcodes.js";
import githubReadme from "./plugins/metalsmith-github-readme.js";
import rootPath from "./plugins/rootPath.js";
import sass from "./plugins/metalsmith-sass.js";
import path from "path";
import { readFileSync } from "fs";

const config = JSON.parse(readFileSync("./config.json"));

const draftMode = !!process.env.DRAFT;

config.siteMetadata.year = new Date().getFullYear();

Metalsmith(".")
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
    .use(drafts(draftMode))
    .use(githubReadme())
    .use(shortcodes({
        files: [".md"],
        shortcodes: {
            sixfiveohtwo: (buf, opts, meta) => {
                const src = path.join("src", path.dirname(meta.file), opts.src);

                const code = readFileSync(src);

                const cleanedCode = code.toString().replace(/</g, "&lt").replace(/>/g, "&gt");

                return `<pre class="hidden logiclogue-6502-asm logiclogue-8bit-ethers" data-ram-id="example-${opts.id}">${cleanedCode}</pre>\n\n\`\`\`asm\n${code}\`\`\``;
            },
            zx_screen: (buf, opts) => {
                return `<canvas class="u-full-width logiclogue-zx-screen" data-ram-id="example-${opts.id}" width="256" height="192" style="image-rendering: pixelated"></canvas>`;
            },
            ez_pentagon_screen: (buf, opts) => {
                return `<canvas class="u-full-width logiclogue-ez-pentagon-screen" data-ram-id="example-${opts.id}" width="256" height="192" style="image-rendering: pixelated"></canvas>`;
            },
            ez_susa_screen: (buf, opts) => {
                return `<canvas class="u-full-width logiclogue-ez-susa-screen" data-ram-id="example-${opts.id}" width="${opts.width || 256}" height="${opts.height || 192}" style="image-rendering: pixelated"></canvas>`;
            }
        }
    }))
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
