const fs = require("fs");
const archiver = require('archiver');
const unzip = require('unzip-stream');

const {readdir} = fs.promises;

/**
 * A class responsible for writing and applying storage folder
 * archived streams.
 */
class StreamStorage {

    /**
     * Creates a new instance of the storage object.
     * @param _path Database storage folder path.
     */
    constructor(_path) {
        this.path = _path;
    }

    /**
     * Writes an archived storage folder dump to a target stream specified.
     * ZLIB compression level is 9.
     * @param output A stream to receive the dump.
     * @returns {Promise<void>}
     */
    async toStream(output) {

        /**
         * Builds a list of all sub-folders within a given folder.
         * @param source The given folder.
         * @returns {Promise<string[]>} The list of sub-folders.
         */
        const getDirectories = async source =>
            (await readdir(source, {withFileTypes: true}))
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name)

        const archive = archiver('zip', {
            zlib: {
                level: 9
            }
        });

        archive
            .pipe(output);

        // List schema (directories within the storage)
        const schema = await getDirectories(this.path);

        // Explicitly add all sub-folders
        for (const directory of schema) {
            archive.directory(`${this.path}${directory}/`, `/${directory}`);
        }

        await archive.finalize();
    }
}

/**
 * A class responsible for making and applying
 * storage folder archived file dumps.
 */
class FileStreamStorage extends StreamStorage {

    targetPath() {
        return `${this.path}.zip`;
    }

    /**
     * Creates an archived storage folder dump as a file.
     * @returns {Promise<string>} Resulting dump path within the local file system.
     */
    async toFile() {
        const path = this.targetPath();
        const output = fs.createWriteStream(path);
        await super.toStream(output);
        return path;
    }

    async fromFile(_archivePath = undefined) {

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

    async removeFile() {
        await fs.rm(this.targetPath(), () => {
        });
    }
}

module.exports = {
    StreamStorage,
    FileStreamStorage
}
