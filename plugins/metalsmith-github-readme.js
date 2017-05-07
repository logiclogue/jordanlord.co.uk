var request = require('request');

function plugin() {
    function getReadMe(githubLink) {
        var url =
            'https://raw.githubusercontent.com/' +
            githubLink +
            '/master/README.md';

        return new Promise(function (resolve, reject) {
            request(url, function (error, response, body) {
                if (error) {
                    reject(new Error());

                    return;
                }

                resolve(body);
            });
        });
    }

    return function (files, metalsmith, done) {
        var fileName;
        var fileArray = [];

        for (fileName in files) {
            file = files[fileName];

            if (file.github) {
                fileArray.push(file);
            }
        }

        var promisesFileArray = fileArray.map(function (file) {
            return new Promise(function (resolve, reject) {
                getReadMe(file.github)
                    .then(function (contents) {
                        file.contents += contents;

                        resolve();
                    }, function (err) {
                        reject();
                        throw err;
                    });
            });
        });

        Promise.all(promisesFileArray)
            .then(function () {
                done();
            }, function (err) {
                throw err;
            });
    }
}

module.exports = plugin;
