const express = require('express')
const firebase = require("firebase");
const snmp = require('snmp-native')
const dateFormat = require('dateformat')
const app = express()
/* root / root1234 */
const {exec} = require('child_process')

var config = {
    apiKey: "AIzaSyCjFxu7Ft4mfHp8ksLYoRkOSWeK4tRmI0w",
    authDomain: "showdowndata.firebaseapp.com",
    databaseURL: "https://showdowndata.firebaseio.com",
    projectId: "showdowndata",
    storageBucket: "showdowndata.appspot.com",
    messagingSenderId: "811451470025"
  }
firebase.initializeApp(config);
// get data from firebase
var db  = firebase.database().ref('db')

var dbInfo = []
//when you have some data update
db.on('child_added', function (snapshot) {
  var item = snapshot.val()
  item.id = snapshot.key
  dbInfo.push(item)
  console.log(dbInfo)
})
 // checking for update from firebase
db.on('child_changed', function (snapshot) {
  var id = snapshot.key
  var sNode = dbInfo.find(info => info.id === id)
  sNode.node = snapshot.val().node
  sNode.ip = snapshot.val().ip
  sNode.onlinenow = snapshot.val().onlinenow
  sNode.inbound = snapshot.val().inbound
  sNode.outbound = snapshot.val().outbound
  sNode.speedtestUp = snapshot.val().speedtestUp
  sNode.speedtestDown = snapshot.val().speedtestDown
  sNode.utilize = snapshot.val().utilize

  console.log( ' CHANGE dbInfo \n ' + dbInfo)
})
/////////////////////// Network Variable Start here ///////////////////////
var dataGet = ""
var online = ""
var ipNow = ""
var sumInbound = 0
var sumOutbound = 0
var download = 0
var upload = 0
/////////////////////// Network Variable End here ///////////////////////

/*----------------------------------------------------------------------*/


setInterval(() => {
 console.log("We're Here now @ setInterval")

 /////////////////////// Date Variable Start here ///////////////////////
 var now = new Date()
 var date = dateFormat(now, "d/m/yyyy")
 var time = dateFormat(now, "HH:MM:ss")
 /////////////////////// Date Variable End here ////////////////////////
 showResult()
 sendtoFirebase("Node1",date,time)
speedTest().then((result) => {
  let newResult = result.replace(/(\r\n|\n|\r)/gm,"")
  let indexOfdownload = newResult.indexOf("M")
  let indexOfupload = newResult.indexOf("s")
  let indexOfupload2 =  newResult.lastIndexOf("M")
  download = newResult.slice(0,indexOfdownload)
  upload = newResult.slice(indexOfupload+1,indexOfupload2)
    download = download.trim()
    upload = upload.trim()
})
 getMIB("Node1")
}, 60000)


 function showResult(){
  getIP().then(getOnline).then( (data) => {
    dataGet = data
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
   let newIP = ip.replace(/(\r\n|\n|\r)/gm,"").concat("/24")
   return new Promise((resolve, reject) => {
    exec('nmap -sP '+ newIP, (err,stdout,stderr) =>{
     if(err) return reject(err)
     else resolve(`${stdout}`)
      })
    })
}

function sendtoFirebase(nodeName){
  let check = dbInfo.find(info => info.node === nodeName)

  if(check){
    firebase.database().ref('db/' + check.id).update({
      ip: ipNow,
      onlinenow: online,
      speedtestUp: upload,
      speedtestDown: download
    })
  }else {
    let sendData =  {
        node: nodeName,
        ip: ipNow,
        onlinenow: online,
        inbound: [{
            value: 0,
            date: date,
            time: time
        }],
        outbound:[{
            value: 0,
            date: date,
            time: time
        }],
        speedtestUp:0,
        speedtestDown:0,
        utilize:0,
        packetloss:0
        }
    return new Promise((resolve, reject) => {
      if(!db.push(sendData)) return reject( "Error can't send data to Firebase")
      else return resolve(db.push(sendData))
    })

  }

}
//////////////////////////////////// Getting MIB /////////////////////////////////////////////
function getMIB(nodeName,date,time){
    let info = {} // all data will be here
    var inbound = []
    let deviceNetwork = new snmp.Session({ host:'192.168.1.254' }) // 10.4.15.1 // 192.168.1.254
    //getInbound
      deviceNetwork.getSubtree({ oid: [1, 3, 6, 1, 2, 1, 2, 2, 1, 10] }, function (err, varbinds) {
        if (err) {
          console.log(err)
        } else {
            varbinds.forEach((varbind) => {
              let data = {
                indexOID: varbind.oid[10],
                inbound: parseInt(varbind.value / 1048576)
              }
              inbound.push(data)
            })
            // console.log(inbound) out commend for checking data
        }
    })

    let outbound = []
    deviceNetwork.getSubtree({ oid: [1, 3, 6, 1, 2, 1, 2, 2, 1, 16] }, function (err, varbinds) {
      if (err) {
        console.log(err)
      } else {
          varbinds.forEach((varbind) => {
            let data = {
              indexOID: varbind.oid[10],
              outbound: parseInt(varbind.value / 1048576)
            }
            outbound.push(data)
          })
        //  console.log(outbound) out commend for checking data
      }
  })

  let intName = []
  let countInterface = 0
  deviceNetwork.getSubtree({ oid: [1, 3, 6, 1, 2, 1, 2, 2, 1, 2] }, function (err, varbinds) {
    if (err) {
      console.log(err)
    } else {
        varbinds.forEach((varbind) => {
          let data = {
            indexOID: varbind.oid[10],
            intName: varbind.value
          }
          intName.push(data)
          if((varbind.value).toString().toLowerCase().charAt(0) === 'f' ||  (varbind.value).toString().toLowerCase().charAt(0) == 'g'){
            countInterface++
          }
        })
        //console.log(intName) out commend for checking data
        console.log("Total interface is :" + countInterface)
    }


      for (var i = 0; i < countInterface; i++) {
         sumInbound += inbound[i].inbound
         sumOutbound += outbound[i].outbound
       }

  console.log(sumInbound)
  })

  let check = dbInfo.find(info => info.node === nodeName)
  if(check){
    let checkInbound = check.inbound
    let checkOutbound = check.outbound
    let insertIn = {
      value: sumInbound,
      date: date,
      time: time
    }
    let insertOut = {
      value: sumOutbound,
      date: date,
      time: time
    }
      checkInbound.push(insertIn)
      checkOutbound.push(insertOut)
      firebase.database().ref('db/' + check.id).update({
      inbound: checkInbound,
      outbound: checkOutbound
    })
    sumInbound = sumOutbound = 0
  }
}

function speedTest(){
  return  new Promise((resolve, reject) => {
   exec('python speedtest-cli | grep \'Download:\\|Upload:\'|cut -d: -f2',{
     cwd: '/project1'
   }, (err,stdout,stderr) =>{
       setTimeout(() => {
         if(err) return reject(err)
         else resolve(`${stdout}`)
       })
     })
   })
}


// Define port number as 3000
const port = 3000;

// Routes HTTP GET requests to the specified path "/" with the specified callback function
app.get('/', function(request, response) {
    response.send(ipNow + "ออนไลน์ user" + online)
})

// Make the app listen on port 3000
app.listen(port, function() {
  console.log('Server listening on http://localhost:' + port)
})
