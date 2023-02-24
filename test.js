const dump = require("./main");

const main = async function () {

    let token;

    const firstStorage = new dump.FileStreamStorage("./storages/storage-1");
    token = await firstStorage.toFile();
    console.log(token);

    const secondStorage = new dump.FileStreamStorage("./storages/storage-3")
    token = await secondStorage.fromFile("./storages/storage-1/.zip");
    console.log(token);

    const thirdStorage = new dump.HTTPStreamStorage("./storages/storage-3");
    token = await thirdStorage.fromURI("https://europe-west1-hype-dev.cloudfunctions.net/storage-timeline");
    console.log(token);

    await firstStorage.removeFile();
};

main().then(() => {
});
