const express = require('express');
const app = express();
const {
    v4: uuidv4
} = require('uuid');
const igniter = require('./igniter');

const fs = require('fs');
const archiver = require('archiver');

app.use(express.json());
app.use(express.static('public'))


app.get('/api/', (req, res) => {
    res.send({
        message: "Welcome to igniter , make a post request to /generate , to ignite your app"
    })
})

app.post('/generate', (req, res) => {
    let app = req.body;



    let appTempId = uuidv4();

    try {
        igniter(app, appTempId, (err) => {
            if (err) {
                res.send({
                    generated: false,
                    message: err.toString()
                })
                console.log(err)
                return
            }
            var output = fs.createWriteStream(__dirname + `/public/apps/${appTempId}.zip`);
            var archive = archiver('zip');

            output.on('close', function () {
                console.log(archive.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');

                //delete temporary generated dir after zip compelted
                let dir = __dirname + `/${appTempId}`
                fs.rmdir(dir, {
                    recursive: true
                }, (err) => {
                    if (err) {
                        throw err;
                    }
                });

                res.send({
                    generated: true,
                    url: `/apps/${appTempId}.zip`
                })
            });

            archive.on('error', function (err) {
                throw err;
            });

            archive.pipe(output);

            // append files from a sub-directory, putting its contents at the root of archive
            archive.directory(`./${appTempId}`, app.name);

            // append files from a sub-directory and naming it `new-subdir` within the archive
            // archive.directory('subdir/', false);

            archive.finalize();



        });

    } catch (error) {
        res.send({
            err: error
        })
    }










})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Igniter is running")
})