import express from "express"
import cors from "cors"
import multer from "multer"
import path from "path"
import fs from "fs"
import { stderr, stdout } from "process"
import {exec} from "child_process" // watch out

const app = express()

app.get('/', function(req, res){
    res.json({message: "FilmFair Stream"})
})

//Multer Middleware
const storage = multer.diskStorage({
    destination: function(req, file, cb){
      cb(null, "./uploads")
    },
    filename: function(req, file, cb){
      cb(null, file.fieldname + "-" + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})


app.use(
    cors({
      origin: '*',
      credentials: true
    })
)

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use("/uploads", express.static("uploads"))


app.post("/upload", upload.single('file'), function(req, res){
    const lessonId = 'WohPal';
    const videoPath = req.file.path
    const outputPath = `./uploads/${lessonId}`
    const hlsPath = `${outputPath}/WohPal1080p.m3u8`
    console.log("hlsPath", hlsPath)
  
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, {recursive: true})
    }
  
    // ffmpeg
    const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/1080pSegment%03d.ts" -start_number 0 ${hlsPath}`;
  
    // no queue because of POC, not to be used in production
    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.log(`exec error: ${error}`)
      }
      console.log(`stdout: ${stdout}`)
      console.log(`stderr: ${stderr}`)
      const videoUrl = `http://localhost:8000/uploads/${lessonId}/WohPal1080p.m3u8`;
  
      res.json({
        message: "Video converted to HLS format",
        videoUrl: videoUrl,
        lessonId: lessonId
      })
    })
  })



app.listen(8000, function(){
    console.log("App is listening at port 8000...")
})