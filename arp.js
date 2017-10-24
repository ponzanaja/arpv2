const express = require('express');
const app = express();
/* root / root1234 */
const {exec} = require('child_process')
var dataGet = ""
var online = ""
var ipNow = ""

setInterval(() => {
 console.log("We're Here now @ setInterval")
 showResult()
}, 10000)

 function showResult(){
  getIP().then(getOnline).then( () => {
    dataGet = `${stdout}`
    let indexOfuser = dataGet.lastIndexOf("(")
    let onlineUser = dataGet.slice(indexOfuser+1,indexOfuser+2)
     online = onlineUser
  }).catch((error) => {console.error(error.message)} )

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
   let newIP = ip.concat("\/24")
   let nstr = "192.168.1.44/24"
   console.log("This is new string of IP : "+newIP)
   console.log("This is normal output string of : "+nstr)
   console.log("this is just normal string : 192.168.1.44/24");
   return new Promise((resolve, reject) => {
    exec('nmap -sP '+ nstr, (err,stdout,stderr) =>{
     if(err) return reject(err)
     else resolve(`${stdout}`)
      })
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
