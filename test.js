const dump = require("./main");

const main = async function () {

    let token;

    const archiver = new dump.FileStreamStorage("./storages/storage-1/");
    const extractor = new dump.FileStreamStorage("/var/tmp/")

    token = await archiver.toFile();
    console.log(token);

    token = await extractor.fromFile("./storages/storage-1/.zip");
    console.log(token);
};

main().then(() => {
});
