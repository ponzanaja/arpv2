const {exec} = require('child_process')
var dataGet = ""
exec('nmap -sP 192.168.1.1/24', (err,stdout,stderr) =>{
  if(err){
    //mean they have error
    return
  }

dataGet = `${stdout}`

var indexOfuser = dataGet.lastIndexOf("(")
var onlineUser = dataGet.slice(indexOfuser+1,indexOfuser+2)

console.log(onlineUser)
})
