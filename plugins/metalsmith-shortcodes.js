import parser from "shortcode-parser";
import path from "path";

const plugin = opts =>
    (files, metalsmith, done) => {
        setImmediate(done);

        const shortcodeOpts = opts || {};

        if (shortcodeOpts.shortcodes !== undefined) {
            Object.keys(shortcodeOpts.shortcodes).forEach((shortcode) => {
                parser.add(shortcode, shortcodeOpts.shortcodes[shortcode]);
            });
        } else {
            console.log("No Shortcodes given");
        }

        Object.keys(files).forEach((file) => {
            let ext = path.extname(file);

            if (!shortcodeOpts.files || (shortcodeOpts.files && shortcodeOpts.files.indexOf(ext) != -1)) {
                const out = parser.parse(files[file].contents.toString("utf8"), { file });

                files[file].contents = Buffer.from(out, "utf8");
            }
        });
    };

export default plugin;
