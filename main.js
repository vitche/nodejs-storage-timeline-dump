const fs = require("fs");
const archiver = require('archiver');
const unzip = require('unzip-stream');

const {readdir} = fs.promises;

/**
 * Builds a list of all sub-folders within a given folder.
 * @param source The given folder.
 * @returns {Promise<string[]>} The list of sub-folders.
 */
const getDirectories = async source =>
    (await readdir(source, {withFileTypes: true}))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

/**
 * A class responsible for making and applying
 * storage folder archived dumps.
 */
class Archiver {

    /**
     * Creates a new instance of the archiver object.
     * @param _path Database storage folder path.
     */
    constructor(_path) {
        this.path = _path;
    }

    targetPath() {
        return `${this.path}.zip.lzma`;
    }

    /**
     * Creates an archived storage folder dump.
     * ZLIB compression level is 9.
     * @returns {Promise<string>} Resulting dump path within the local file system.
     */
    async archive() {

        const archive = archiver('zip', {
            zlib: {
                level: 9
            }
        });
        const output = fs.createWriteStream(this.targetPath());
        archive
            .pipe(output);

        // List schema (directories within the storage)
        const schema = await getDirectories(this.path);

        // Explicitly add all sub-folders
        for (const directory of schema) {
            archive.directory(`${this.path}${directory}/`, `/${directory}`);
        }

        await archive.finalize();

        return this.targetPath();
    }

    async extract(_archivePath = undefined) {

        let sourceFilePath;
        if (_archivePath) {
            sourceFilePath = _archivePath;
        } else {
            sourceFilePath = this.targetPath();
        }

        const readStream = fs.createReadStream(sourceFilePath);
        readStream
            .pipe(unzip.Extract({
                path: this.path
            }));

        return this.path;
    }
}

module.exports = {
    Archiver
}
