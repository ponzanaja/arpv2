const express = require('express');
const app = express();
/* root / root1234 */
const {exec} = require('child_process')
var dataGet = ""
var online = ""
var ipNow = ""


async function showResult(){
  var a = await getIP();
  var b = await getOnline(a);
  console.log(b);

}


function getIP(){
  exec('/sbin/ifconfig eth0 | grep \'inet addr:\' | cut -d: -f2 | awk \'{ print $1}\'', (err,stdout,stderr) =>{
      if(err){
        //mean they have error
        return
      }
      console.log(ipNow)
      return ipNow = `${stdout}`

    })
}

function getOnline(ip){
  exec('nmap -sP '+ ip +'/24', (err,stdout,stderr) =>{
    if(err){
      //mean they have error
      return
    }

  dataGet = `${stdout}`

  var indexOfuser = dataGet.lastIndexOf("(")
  var onlineUser = dataGet.slice(indexOfuser+1,indexOfuser+2)

  console.log(onlineUser)
  return online = onlineUser
  })
}




// Define port number as 3000
const port = 3000;

// Routes HTTP GET requests to the specified path "/" with the specified callback function
app.get('/', function(request, response) {
  response.send(ipNow);
  response.send("ทดสอบข้อความ")
  response.send(online);

});

// Make the app listen on port 3000
app.listen(port, function() {
  console.log('Server listening on http://localhost:' + port);
});
