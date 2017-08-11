/**
 * Created by avsek on 8/10/17.
 */

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const app = express();
const config = require('./config/config');

const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/ttyACM0');
const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

const db = require('./config/db');
const mongoose = require('mongoose');

const THData = require('./model/DHTsensor');
mongoose.connect(db.url);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

let server = http.createServer(app);

server.listen(config.port);

server.on('error',(error)=>{
    if(error.syscall !== 'listen'){
        throw error
    }

    let bind = typeof config.port === 'string'
    ? 'Pipe' + config.port
        :'port' + config.port

    switch (error.code){
        case 'EACCES':
            console.log(bind + 'requires elevated privilege')
            process.exit(1)
            break;
        case 'EADDRINUSE':
            console.log(bind + 'port already in use')
            process.exit(1)
            break;
        default:
            break;
    }
})

server.on('listening',()=>{
    let addr = server.address();
    let bind = typeof addr ==='string'
    ?'pipe' + addr
        : 'port' + addr.port;

    if(process.env.Node_ENV !== 'test'){
        console.log('Chart Server listening on' + bind,{});
    }
})


function postData(serialdata) {
    if(serialdata.length == 56){
        var allData = splitData(",", serialdata),
            humidity = splitData(":", allData[0]),
            temperature = splitData(":", allData[1]),
            co = splitData(":", allData[2]),
            co2 = splitData(":", allData[3]);

        console.log(humidity, temperature, co, co2);
        console.log("++++++++++++++++++==")

        var newTHData = new THData();

        newTHData.humidity = parseInt(humidity[1].substring(1, humidity[1].length));
        newTHData.temperature = parseInt(temperature[1].substring(1, temperature[1].length));
        newTHData.co = parseInt(co[1].substring(1, co[1].length));
        newTHData.co2 = parseInt(co2[1].substring(1, co2[1].length));
        newTHData.save(function(error, data){
            if(error){
                return error;
            }
            return true;
        })
    }
}

function splitData(delimiter, data) {
    return data.split(delimiter);
}

setInterval(function(){
    parser.on('data', postData);
}, 5000);


const router = express.Router();

router.get('/sensor-data', function(req, res){
    THData.find(function (error, data) {
        if(error){
            res(error);
        }
        else{
            res.json(data);
        }
    })
        .sort({date: -1})
})

app.use('/api/', router);


module.exports = app;