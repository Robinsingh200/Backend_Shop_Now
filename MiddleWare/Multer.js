import multer from "multer";

const storage = multer.memoryStorage();

// it upload single dile
export const singleUpload = multer({storage}).single("file")    


// it upload multiple  dile
export const MultipleUpload = multer({storage}).array("file", 5)    