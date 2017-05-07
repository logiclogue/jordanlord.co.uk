function plugin() {
    return function (files, metalsmith, done) {
        var file, fileName;

        for (fileName in files) {
            file = files[fileName];

            if (file.github) {
                console.log(fileName);
            }
        }
    }
}

module.exports = plugin;
