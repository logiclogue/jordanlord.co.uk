const _ = require("lodash");
const request = require('request');
const sections = require('sections');

function plugin() {
    function getReadMe(githubLink) {
        const url
            = "https://raw.githubusercontent.com/"
            + githubLink
            + "/master/README.md";

        return new Promise((resolve, reject) => {
            request(url, (error, response, body) => {
                if (error) {
                    reject(error);

                    return;
                }

                if (response.statusCode !== 200) {
                    resolve("");

                    return;
                }

                resolve(body);
            });
        });
    }

    function getRelevantSections(markdown) {
        const sectionsObj = sections.parse(markdown);

        sectionsObj.sections.map((section) => {
            if (section.level === 1) {
                section.string = section.string.replace(section.heading, "");
            } else if (section.title.toLowerCase() === "author") {
                section.string = "";
            }
        });

        return sections.render(sectionsObj);
    }

    return function (files, metalsmith, done) {
        const fileArray = _(files)
            .filter(file => file.github && file.readFromGithub)
            .value();

        fileArray.forEach(file => console.log("Got README from", file.github));

        const promisesFileArray = fileArray.map((file) => {
            return new Promise((resolve, reject) => {
                getReadMe(file.github)
                    .then((contents) => {
                        // Add the README contents to the post's contents
                        file.contents += getRelevantSections(contents);

                        resolve();
                    })
                    .catch(reject);
            });
        });

        Promise.all(promisesFileArray)
            .then(() => done())
            .catch((err) => {
                throw err;
            });
    }
}

module.exports = plugin;
