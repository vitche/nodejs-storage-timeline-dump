const dump = require("./main");

let token = new dump.Archiver("/tmp").archive();
console.log(token);

token = new dump.Archiver("/tmp/.zip.lzma").unarchive();
console.log(token);
