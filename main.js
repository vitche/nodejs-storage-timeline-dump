const fs = require("fs");
const path = require("path");
const {fetch} = require('./fetch');
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
            archive.directory(`${this.path}/${directory}/`, `/${directory}`);
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
        return `${this.path}/.zip`;
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

class HTTPStreamStorage extends StreamStorage {

    /**
     * Restores a dump from the storage HTTP ZIP stream identified by the URI.
     * @param _uri The storage ZIP stream URI.
     * @returns {Promise<{deployTemporary: (function(): Promise<*>), deploy: (function(): Promise<*>)}>}The immediate or temporary deployer.
     */
    async fromURI(_uri) {

        const buildDeployer = (suffix) => {

            return async () => {

                const response = await fetch(_uri, {
                    headers: {
                        "Content-Type": "application/zip"
                    }
                });

                // v.1.0
                // response.body.pipe(unzip.Extract({
                //     path: this.path
                // }));

                // v.2.0
                const self = this;
                await new Promise((resolve, reject) => {
                    response.body.pipe(unzip.Parse())
                        .on('entry', function (entry) {

                            const fileName = entry.path;
                            const newFileName = `${fileName}${suffix}`;
                            const fullPath = self.path + '/' + newFileName;
                            const parentDirectory = path.dirname(fullPath);

                            fs.access(parentDirectory, fs.constants.F_OK, function (error) {
                                if (error) {
                                    // Create the directory if not exists
                                    fs.mkdirSync(parentDirectory, {recursive: true});
                                }
                                // Save file content
                                entry.pipe(fs.createWriteStream(fullPath));
                            });
                        })
                        .on('finish', resolve)
                        .on('error', reject);
                });

                return this.path;
            };
        };

        return {
            deploy: buildDeployer(""),
            deployTemporary: buildDeployer(".tmp")
        };
    }
}

module.exports = {
    StreamStorage,
    FileStreamStorage,
    HTTPStreamStorage
}
