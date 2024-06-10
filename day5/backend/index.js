const express  = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const csv = require("fast-csv");


const { createClient } = require('@supabase/supabase-js');



const supabaseUrl = 'https://vjwpcczqotfqnkxbpxpl.supabase.co'


const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqd3BjY3pxb3RmcW5reGJweHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgwMDEwMzksImV4cCI6MjAzMzU3NzAzOX0.Ie3bcc5Pkg7PB9FlqhgZhLsBCR9OS7OlT4IQ-9GFqqM`


const supabase = createClient(supabaseUrl, supabaseKey)
console.log("Created Client Connection!")



// await client.connect();

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
    res.render("index",{error:"Hi"})
})


app.post("/upload_file", upload.single("avatar") ,async (req,res)=>{
    try{
    console.log("Uploaded Successfully");
    console.log(req.file.filename);
    if(req.file.filename.split('.')[1] != "csv"){
        res.render("index",{error:"Please upload csv file"})
        return;
    }
    // console.log(uniqueSuffix);
    // let json = csvToJson.getJsonFromCsv(`./uploads/${req.file.filename}`);
    // for(let i=0; i<10;i++){
    //     console.log(json[i]);
    // }

    const path = `./uploads/${req.file.filename}`;
    let tutorials = []

    fs.createReadStream(path)
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => {
      throw error.message;
    })
    .on("data", (row) => {
      tutorials.push({email:row['Email'],first_name:row['First Name'],last_name:row['Last Name'],city:row['City'],country:row['Country']});
    })
    .on("end", async () => {
        try{
            const chunkSize = 1000; // Define the chunk size
            const numChunks = Math.ceil(tutorials.length / chunkSize); // Calculate the number of chunks

            const promises = []; // Create an empty array to store the promises

            for (let i = 0; i < numChunks; i++) {
            const chunk = tutorials.slice(i * chunkSize, (i + 1) * chunkSize); // Create a chunk of tutorials
            promises.push(supabase.from('users').insert(chunk)); // Insert the chunk of tutorials using a promise
            }

        await Promise.all(promises); // Wait for all the promises to resolve
        

        }catch(error){
            console.log(error);
        }

        console.log("Ended");
        res.redirect("/");
    });

    

    }catch(error){
        console.log(error);
    }
})

// async function uploadFile(file) {
    // Use the JS library to create a bucket.
    // try{
    // const { data, error } = await supabase.storage.createBucket('avatars', {
    // public: true,
    // allowedMimeTypes: ['*.csv'],
    // fileSizeLimit: '20MB',
    // })
    // }catch(error){
    //     console.log("Error while creating buckets")
    // }

    // const { data, error } = await supabase.storage.from('avatars').upload('/uploads', file)
    // if (error) {
    //   // Handle error
    //   console.log(error)
    // } else {
    //     console.log("Successfully inserted data")
    //   // Handle success
    // }
    
//   }

try{
    app.listen(port);
    console.log(`App is running on port: http://localhost:${port}`);    
}catch(error){
    console.log("App is stopped");
}