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
    token = await (await thirdStorage.fromURI("https://europe-west1-hype-dev.cloudfunctions.net/storage-timeline")).deploy();
    console.log(token);
    token = await (await thirdStorage.fromURI("https://europe-west1-hype-dev.cloudfunctions.net/storage-timeline")).deployTemporary();
    console.log(token);

    await firstStorage.removeFile();

    const fourthStorage = new dump.HTTPStreamStorage("./storages/storage-4");
    token = await (await fourthStorage.fromURI("https://34.133.171.197:82/storage/list")).deploy();
    console.log(token);
};

main().then(() => {
});
