const express  = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const csv = require("fast-csv");
// import connection from "./dbConfig/mydbConfig";
const pool = require("./dbConfig/mydbConfig");

const cors = require("cors");



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
app.use(bodyParser.json());
app.use(express.static('public'))
app.use(cors());


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
                connection.beginTransaction((err)=>{
                    if(err){
                        return res.status(400).json({
                            message:"Error occured"
                        })
                    }
                    let query = 'REPLACE INTO `userss` (`email`,`name`,`contact`) values ?'
                    connection.query(query,[tutorials],(err,res)=>{
                        if(err){
                            console.log(err);
                        }
                    });
                });
                connection.commit(function(err) {
                    if (err) {
                      return connection.rollback(function() {
                        throw err;
                      });
                    }
                    console.log('success!');
                  });
               
                connection.release();
                fs.unlinkSync(path);

                console.log("Delete File successfully.");
                return res.status(200).json({
                    message:"Data uploaded successfully"
                })
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


app.get("/data", async (req,res) =>{
    try{
          
        pool.getConnection((err, connection)=> {
            // connected! (unless `err` is set)
            if(err){
                console.log(err);
            }else{
            let query = 'select id,email,name,contact from student.userss order by id asc  limit 200'
            connection.query(query,(err,data)=>{
                if(err){
                    
                    console.log(err);
                    res.status(400).json({
                        message:"connection error"
                    })
                }else{
                    // console.log(data);
                    res.status(200).json({
                        message:"data got successfully",
                        data:data
                    });
                }
            });
            }
            connection.release();
          });
          

        
          
    }catch(error){
        console.log(error);
        res.status(400).json({
            message:"data not got successfully"
        })
       
    }
})



app.get("/checking",async (req,res)=>{
    try{
        console.log("Got request")
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

app.post("/checking",upload.single("avatar"),async (req,res)=>{
    try{
        console.log("Got request")
        res.status(200).json({
            message:"Successfully uploaded file"
        })
    }catch(error){
        console.log(error)
        res.status(400).json({
            message:"error"
        })
    }
})

app.post("/edit/:id",async (req,res)=>{
    try{
        console.log(req.params.id);
        console.log(req.body);
        const {name,email,contact} = req.body;

        pool.getConnection((err, connection)=> {
            // connected! (unless `err` is set)
            if(err){
                console.log(err);
            }else{
            let query = 'update student.userss set `name`=?, `email`=?, `contact`=? where `id`=? '
            connection.query(query,[name,email,contact,req.params.id],(err,data)=>{
                if(err){
                    
                    console.log(err);
                    res.status(400).json({
                        message:"connection error"
                    })
                }else{
                    // console.log(data);
                    res.status(200).json({
                        message:"data updated successfully",
                        data:data
                    });
                }
            });
            }
            connection.release();
          });
        

    }catch(err){
        console.log(err);
        return res.status(400).json({
            message:"Error ocuured Edit"
        })
    }
})

app.post("/delete/:email",async (req,res)=>{
    try{
        pool.getConnection((err, connection)=> {
            // connected! (unless `err` is set)
            if(err){
                console.log(err);
            }else{
            let query = 'delete from student.userss where `email`=? '
            connection.query(query,[req.params.email],(err,data)=>{
                if(err){
                    
                    console.log(err);
                    res.status(400).json({
                        message:"connection error"
                    })
                }else{
                    // console.log(data);
                    res.status(200).json({
                        message:"data updated successfully",
                        data:data
                    });
                }
            });
            }
            connection.release();
          });
    }catch(error){
        console.log(error);
        return res.status(400).json({
            message:"Error ocuured Delete"
        })
    }
})

app.post("/add",async (req,res)=>{
    try{
        const {name,email,contact} = req.body;
        console.log(email);
        console.log(name);
        console.log(contact);
        pool.getConnection((err, connection)=> {
            // connected! (unless `err` is set)
            if(err){
                console.log(err);
            }else{
                // INSERT INTO `item`
// (`item_name`, items_in_stock)
// VALUES( 'A', 27)
// ON DUPLICATE KEY UPDATE
// `new_items_count` = `new_items_count` + 27


            // let query ='insert ignore into userss (email,name,contact) VALUES ?';
            let query = 'REPLACE INTO `userss` (`email`,`name`,`contact`) values ? '
            const values = [[email,name,contact]];
            connection.query(query,[values],(err,data)=>{
                if(err){
                    
                    console.log(err);
                    res.status(400).json({
                        message:"connection error"
                    })
                }else{
                    console.log(data);
                    res.status(200).json({
                        message:"data Added successfully",
                        data:data
                    });
                }
            });
            }
            connection.release();
          });

    }catch(error){
        console.log(error);
        return res.status(400).json({
            message:"Error at adding"
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
        
    

