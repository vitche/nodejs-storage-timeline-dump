const dump = require("../main");

const main = async function () {

    let token;

    const thirdStorage = new dump.HTTPStreamStorage("../storages/storage-4");
    token = await (await thirdStorage.fromURI("https://europe-west1-hype-dev.cloudfunctions.net/storage-timeline")).deployTemporary();
    console.log(token);
    await thirdStorage.empty();
};

main().then(() => {
});
