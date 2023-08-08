const util = require("util");
const multer = require("multer");
const fs = require('fs');
const maxSize = 2 * 1024 * 1024;

const createDirIfNotExists = dir =>
  !fs.existsSync(dir) ? fs.mkdirSync(dir, { recursive: true }) : undefined;

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(req.body)
    let dir = __basedir + `/public/uploads/users/${req.user.id}/tasks/${req.params.id}/`;
    createDirIfNotExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, file.originalname);
  },
});

let uploadFile = multer({
  storage
})

module.exports = {uploadFile};

// let uploadFileMiddleware = util.promisify(uploadFile);
// module.exports = uploadFileMiddleware;