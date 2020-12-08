const express = require('express')

const bodyParser = require("body-parser");

const fs = require("fs");

const { exec } = require("child_process");

const path = require("path");

var outputFilePath;

const multer = require("multer");

const app = express();

var dir = "public";
var subDirectory = "public/uploads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);

  fs.mkdirSync(subDirectory);
}

app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const audioFilter = function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (
      ext !== ".mp3" &&
      ext !== ".aac" &&
      ext !== ".wmv" &&
      ext !== "wav" &&
      ext !== ".m4a" &&
      ext !== ".flac" &&
      ext !== ".wmf" &&
      ext !== ".wma"
    ) {
      return callback("This Extension is not supported");
    }
    callback(null, true);
  };
  

var audioconverter3 = multer({ storage: storage, fileFilter: audioFilter }).single('file');

app.post(
      "/karaokemaker",
      (req, res) => {
          console.log(req.body.path);
    
          outputFilePath = Date.now() + "output." + path.extname(req.body.path);
    
          exec(
            `ffmpeg -i ${req.body.path} -preset ultrafast -af pan="stereo|c0=c0|c1=-1*c1" -ac 1 ${outputFilePath}`,
            (err, stdout,stderr) => {
              if(err){
                res.json({
                    error:"some error takes place"
                })
            }
            res.json({
                path:outputFilePath
            })
      })
        
      })
    
      app.post('/uploadkaraokemaker',(req,res) =>{
        audioconverter3(req,res,function(err) {
          if(err) {
              return res.end("Error uploading file.");
          }
          res.json({
              path:req.file.path
          })
      });
      })


app.get('/',(req,res) => {
  res.render("karaokemaker",{title:'karaoke maker'})
})

app.get('/download',(req,res) => {
    var pathoutput = req.query.path
    console.log(pathoutput)
    var fullpath = path.join(__dirname,pathoutput)
    res.download(fullpath,(err) =>{
        if(err){
            fs.unlinkSync(fullpath)
            res.send(err)
        }
        fs.unlinkSync(fullpath)
    })
  })
  


app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});