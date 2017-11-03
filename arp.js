const express = require('express')
const firebase = require("firebase");

const app = express()
/* root / root1234 */
const {exec} = require('child_process')

var config = {
  apiKey: "AIzaSyCjFxu7Ft4mfHp8ksLYoRkOSWeK4tRmI0w ",
  authDomain: "showdowndata.firebaseapp.com",
  databaseURL: "https://showDowndata.firebaseio.com",
  storageBucket: "showdowndata.appspot.com",
};
firebase.initializeApp(config);

var db  = firebase.database().ref('db')

var dbInfo = []
db.on('child_added', function (snapshot) {
  var item = snapshot.val()
  item.id = snapshot.key
  dbInfo.push(item)
  console.log(dbInfo)
})

var dataGet = ""
var online = ""
var ipNow = ""

setInterval(() => {
 console.log("We're Here now @ setInterval")
 showResult()
}, 10000)

 function showResult(){
  getIP().then(getOnline).then( (data) => {
    dataGet = data
    let indexOfuser = dataGet.lastIndexOf("(")
    let onlineUser = dataGet.slice(indexOfuser+1,indexOfuser+2)
     online = onlineUser
  }).then(sendToFirebase("Node 1")).catch((error) => {console.error(error.message)} )

}

 function getIP(){
   console.log("We're getting in IP")
   return new Promise((resolve, reject) =>{
     exec('/sbin/ifconfig eth0 | grep \'inet addr:\' | cut -d: -f2 | awk \'{ print $1}\'', (err,stdout,stderr) =>{
             if(err) reject(err)
             else resolve( ipNow = `${stdout}`)
      })
    })
}

 function getOnline(ip){
   console.log("This Is IP Parameter " +ip)
   let newIP = ip.replace(/(\r\n|\n|\r)/gm,"").concat("/24")
   return new Promise((resolve, reject) => {
    exec('nmap -sP '+ newIP, (err,stdout,stderr) =>{
     if(err) return reject(err)
     else resolve(`${stdout}`)
      })
    })
}

function sendtoFirebase(nodeName){
  var sendData =  {
      node: nodeName,
      ip: global ipNow,
      onlinenow: global online
  }
  return new Promise((resolve, reject) => {
    if(!db.push(sendData)) return reject( "Error can't send data to Firebase")
    else return resolve(db.push(sendData))
  })
}


// Define port number as 3000
const port = 3000;

// Routes HTTP GET requests to the specified path "/" with the specified callback function
app.get('/', function(request, response) {
    response.send(ipNow + "ออนไลน์ user" + online);

});

// Make the app listen on port 3000
app.listen(port, function() {
  console.log('Server listening on http://localhost:' + port);
});
