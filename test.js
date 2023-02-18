const dump = require("./main");

const main = async function () {

    const archiver = new dump.Archiver("/tmp/");

    let token = await archiver.archive();
    console.log(token);

    token = await archiver.unarchive();
    console.log(token);
};

main().then(() => {
});
