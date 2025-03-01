import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(Error("Destination undefined"), "public/temp");
  },
  filename: function (req, file, cb) {
    cb(Error("Filename undefined"), `${file.originalname}-${Date.now()}`);
  },
});

export const upload = multer({ storage });
