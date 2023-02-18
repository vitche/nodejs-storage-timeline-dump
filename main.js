const fs = require("fs");
const archiver = require('archiver');

class Archiver {

    constructor(_path) {
        this.path = _path;
    }

    async archive() {

        const targetPath = `${this.path}.zip`;

        const output = fs.createWriteStream(targetPath);
        const archive = archiver('zip', {
            zlib: {
                level: 9
            }
        });

        archive.pipe(output);

        await archive.finalize();

        return targetPath;
    }

    async unarchive() {
        return "/tmp/";
    }
}

module.exports = {
    Archiver
}
