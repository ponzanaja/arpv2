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

async function showResult(){
    console.log("We're Get in show result now")
  let a = await getIP();
  let b = await getOnline(a);
  console.log(b);

}


async function getIP(){
  await exec('/sbin/ifconfig eth0 | grep \'inet addr:\' | cut -d: -f2 | awk \'{ print $1}\'', (err,stdout,stderr) =>{
      if(err){
        //mean they have error
        return
      }
      ipNow = `${stdout}`
      return ipNow

    })
}

async function getOnline(ip){
  console.log("We're @ online ")
  console.log('nmap -sP '+ ipNow +'/24')
  console.log(ipNow)
  await exec("nmap -sP "+ ipNow +"/24, (err,stdout,stderr)" =>{
    if(err){
      //mean they have error
      return
    }
  
   await dataGet = `${stdout}`
   await console.log(dataget);

  let indexOfuser = dataGet.lastIndexOf("(")
  let onlineUser = dataGet.slice(indexOfuser+1,indexOfuser+2)

  console.log(onlineUser)
   online = onlineUser
  return  online
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
