const express  = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const csv = require("fast-csv");
// import connection from "./dbConfig/mydbConfig";
const pool = require("./dbConfig/mydbConfig");



let progress;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix)
    }
  })

  
const upload = multer({ storage: storage })


const port = 3001;
const app = express();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))


app.get("/",async (req,res)=>{
    res.render("index",{error:"Hi",table:[null]})
})



app.post("/upload_file", upload.single("avatar") ,async (req,res)=>{
    try{
    console.log("Uploaded Successfully");
    console.log(req.file.filename);
    if(req.file === null){
        res.render("index",{error:'Please upload file'})

        return;
    }
    if(req.file.filename.split('.')[1] != "csv"){
        res.render("index",{error:"Please upload csv file"})
        return;
    }

    const path = `./uploads/${req.file.filename}`;
    let tutorials = []

    fs.createReadStream(path)
    .pipe(csv.parse())
    .on("error", (error) => {
      throw error.message;
    })
    .on("data", (row) => {
            tutorials.push(row);
    })
    .on("end", async () => {
        try{
            tutorials.shift();
            console.log(tutorials.length);
            
        

            pool.getConnection((err, connection)=> {
                // connected! (unless `err` is set)
                if(err){
                    console.log(err);
                }else{
                let query = 'INSERT IGNORE INTO USERSS (id,email,first_name,last_name,city,company) VALUES ?'
                connection.query(query,[tutorials],(err,res)=>{
                    if(err){
                        console.log(err);
                    }
                });
                fs.unlinkSync(path);

                console.log("Delete File successfully.");
                res.render("index",{error:"Uploaded Successfully!!",table:[null]});
                }
              });
            
        

        }catch(error){
            fs.unlinkSync(path);
            console.log(error);
        }
        
    });

    

    

    }catch(error){
        console.log(error);
    }
})

app.post("/checking",async (req,res)=>{
    try{
        console.log(req.body);
        res.status(200).json({
            message:"Hi"
        })
    }catch(error){
        console.log(error)
        res.status(400).json({
            message:"error"
        })
    }
})



    app.listen(port,(err)=>{
        if(err){
            console.log(err);
        }else{
            console.log(`App is running on port: http://localhost:${port}`);
        }
    });
        
    

