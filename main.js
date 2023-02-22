const fs = require("fs");
const archiver = require('archiver');

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

    /**
     * Creates an archived storage folder dump.
     * ZLIB compression level is 9.
     * @returns {Promise<string>} Resulting dump path within the local file system.
     */
    async archive() {

        const targetPath = `${this.path}.zip`;

        const output = fs.createWriteStream(targetPath);
        const archive = archiver('zip', {
            zlib: {
                level: 9
            }
        });
        archive.pipe(output);

        // List schema (directories within the storage)
        const schema = await getDirectories(this.path);

        // Explicitly add all sub-folders
        for (const directory of schema) {
            archive.directory(`${this.path}${directory}/`, `/${directory}`);
        }

        await archive.finalize();
        return targetPath;
    }

    async extract(_archivePath = undefined) {
        throw new Error("Not implemented");
    }
}

module.exports = {
    Archiver
}
