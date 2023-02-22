const dump = require("./main");

const main = async function () {

    const archiver = new dump.Archiver("./storage/");

    let token = await archiver.archive();
    console.log(token);

    // token = await archiver.extract("./storage/.zip");
    // console.log(token);
};

main().then(() => {
});
