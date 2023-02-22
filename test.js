const dump = require("./main");

const main = async function () {

    let token;

    const archiver = new dump.Archiver("./storage/");
    const extractor = new dump.Archiver("/var/tmp/")

    token = await archiver.archive();
    console.log(token);

    token = await extractor.extract("./storage/.zip.lzma");
    console.log(token);
};

main().then(() => {
});
