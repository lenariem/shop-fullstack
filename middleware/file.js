const multer = require('multer')

const storage = multer.diskStorage({
    //where to save
    destination(req, file, cb) {
        cb(null, 'images')
    },
    //under which name save
    filename(req, file,cb) {
        //unique name for avatar; windows not allows : in name!
        cb(null, `${new Date().toISOString().replace(/:/g, '-')}-${file.originalname.replace(/\s/g, '_')}`)
    }
})

//validation of img format 
const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']
const fileFilter = (req, file, cb) => {
    if(allowedTypes.includes(file.mimetype)) {
        cb(null, true) 
    } else {
        cb(null, false)
    }
}

module.exports = multer({storage, fileFilter})