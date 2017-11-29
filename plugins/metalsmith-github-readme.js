var request = require('request');
var sections = require('sections');

function plugin() {
    function getReadMe(githubLink) {
        var url =
            'https://raw.githubusercontent.com/' +
            githubLink +
            '/master/README.md';

        return new Promise(function (resolve, reject) {
            request(url, function (error, response, body) {
                if (error) {
                    reject(error);

                    return;
                }

                if (response.statusCode !== 200) {
                    resolve('');

                    return;
                }

                resolve(body);
            });
        });
    }

    function getRelevantSections(markdown) {
        var sectionsObj = sections.parse(markdown);

        sectionsObj.sections.map(function (section) {
            if (section.level === 1) {
                section.string = section.string.replace(section.heading, '');
            } else if (section.title.toLowerCase() === 'author') {
                section.string = '';
            }
        });

        return sections.render(sectionsObj);
    }

    return function (files, metalsmith, done) {
        var fileName;
        var fileArray = [];

        for (fileName in files) {
            file = files[fileName];

            if (file.github && file.readFromGithub) {
                console.log('Got README from', file.github);
                fileArray.push(file);
            }
        }

        var promisesFileArray = fileArray.map(function (file) {
            return new Promise(function (resolve, reject) {
                getReadMe(file.github)
                    .then(function (contents) {
                        // Add the README contents to the post's contents
                        file.contents += getRelevantSections(contents);

                        resolve();
                    }, function (err) {
                        reject(err);
                    });
            });
        });

        Promise.all(promisesFileArray)
            .then(function () {
                done();
            })
            .catch(function (err) {
                throw err;
            });
    }
}

module.exports = plugin;
