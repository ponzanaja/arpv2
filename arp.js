/*Testing Update texting from web  */
const express = require('express')
const firebase = require('firebase')
const snmp = require('snmp-native')
const dateFormat = require('dateformat')
//const app = express()
const inboundOID = [1, 3, 6, 1, 2, 1, 2, 2, 1, 10]
const outboundOID = [1, 3, 6, 1, 2, 1, 2, 2, 1, 16]
const packetinUOID = [1, 3, 6, 1, 2, 1, 2, 2, 1, 11]
const pktsInErrOID = [1, 3, 6, 1, 2, 1, 2, 2, 1, 14]
const pktsOutErrOID = [1, 3, 6, 1, 2, 1, 2, 2, 1, 14]
const intNameOID = [1, 3, 6, 1, 2, 1, 2, 2, 1, 2]
const intSpeed = [1, 3, 6, 1, 2, 1, 2, 2, 1, 5]
const freeMemoryOID = [1, 3, 6, 1, 4, 1, 9, 2, 1, 8, 0] // max 128MB
const temparatureOID = [1, 3, 6, 1, 4, 1, 9, 9, 13, 1, 3, 1, 3, 1005]
const cpuUsageOID = [1,3,6,1,4,1,9,2,1,57,0]


const nodeNIP = '10.4.15.1'
const fixTime = 5
const nName = 'Node415'
const firebaseKey = '-L46xegEleuKcTnJXDjg'
/* root / root1234 10.4.15.1  192.168.1.254*/ 
const {exec} = require('child_process')

let config = {
  apiKey: 'AIzaSyCjFxu7Ft4mfHp8ksLYoRkOSWeK4tRmI0w',
  authDomain: 'showdowndata.firebaseapp.com',
  databaseURL: 'https://showdowndata.firebaseio.com',
  projectId: 'showdowndata',
  storageBucket: 'showdowndata.appspot.com',
  messagingSenderId: '811451470025'
}
firebase.initializeApp(config)
// get data from firebase
let db = firebase.database().ref('db')

let dbInfo = []
// when you have some data update
/*db.on('child_added', function (snapshot) {
  let item = snapshot.val()
  item.id = snapshot.key
  dbInfo.push(item)
})
// checking for update from firebase
db.on('child_changed', function (snapshot) { 
  let data = snapshot.val()
  data.id = snapshot.key
  let arrTemp = []
  arrTemp.push(data)
  dbInfo = arrTemp
})
db.on('child_removed', function (snapshot) {
    var id = snapshot.key
    var index = dbInfo.findIndex(user => user.id === id)
     userInfo.splice(index,1)
})*/
/// //////////////////// Network variable Start here ///////////////////////
let dataGet = ''
let online = ''
let ipNow = ''
let sumInbound = 0
let sumOutbound = 0
let download = 0
let upload = 0
let sumInpkts = 0
let packetloss = 0
let temparature = 0
let humanity = 0
let temparatureSw = 0
let cpu = 0
let memory = 0
let iplist = []
let flagSend = false
/// //////////////////// Network variable End here ///////////////////////

/* ---------------------------------------------------------------------- */

setInterval(() => { 
    let now = new Date()
    let date = dateFormat(now, 'd/m/yyyy')
    let time = dateFormat(now, 'HH:MM:ss')
    let minutes = now.getMinutes()
    if(minutes === fixTime && !(flagSend)){
        speedTest().then((result) => {
            let newResult = result.replace(/(\r\n|\n|\r)/gm, '')
            let indexOfdownload = newResult.indexOf('M')
            let indexOfupload = newResult.indexOf('s')
            let indexOfupload2 = newResult.lastIndexOf('M')
            download = newResult.slice(0, indexOfdownload)
            upload = newResult.slice(indexOfupload + 1, indexOfupload2)
            download = download.trim()
            upload = upload.trim()
            firebase.database().ref().child('db/'+firebaseKey+'/speedtest').push({
                    valuedown: download,
                    valueup: upload,
                    date: date,
                    time: time  
            })
          })
          flagSend = true
    }else if(minutes !== fixTime){
        flagSend = false
    }
},30000)

setInterval(() => {
  /// //////////////////// Date variable Start here ///////////////////////
  let now = new Date()
  let date = dateFormat(now, 'd/m/yyyy')
  let time = dateFormat(now, 'HH:MM:ss')
  /// //////////////////// Date variable End here ////////////////////////
  showResult()
  sendtoFirebase(nName, date, time)
  
  getMIB(nName, date, time)
  sendTemparature().then((result) => {
    let newResult = result.replace(/(\r\n|\n|\r)/gm, '')
    let indexOfTemparature = newResult.indexOf('T')
    humanity = newResult.slice(1,indexOfTemparature)
    temparature = newResult.slice(indexOfTemparature+1 )
    humanity = humanity.trim()
    temparature = temparature.trim()
  })
}, 300000)

function showResult () {
  getIP().then(getOnline).then((data) => {
    dataGet = data
    let indexOfuser = dataGet.lastIndexOf('(')
    let lastOfIndex = dataGet.lastIndexOf('host')
    let onlineUser = dataGet.slice(indexOfuser + 1, lastOfIndex-1)
    online = onlineUser
    let re = /(\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3})\n/g
    let found = data.match(re)
    iplist = found.map(found => found.trim())
  }).catch((error) => {
    console.error(error.message)
  })
}

function getIP () {
  // console.log("We're getting in IP")
  return new Promise((resolve, reject) => {
    exec('/sbin/ifconfig eth0 | grep \'inet addr:\' | cut -d: -f2 | awk \'{ print $1}\'', (err, stdout, stderr) => {
      if (err) reject("get IP Error :"+err)
      else resolve(ipNow = `${stdout}`)
    })
  })
}

function getOnline (ip) {
  //console.log('This Is IP Parameter ' + ip)
  let newIP = ip.replace(/(\r\n|\n|\r)/gm, '').concat('/24')
  return new Promise((resolve, reject) => {
    exec('nmap -sP ' + newIP, (err, stdout, stderr) => {
      if (err) return reject("get Online Error : "+err)
      else resolve(`${stdout}`)
    })
  })
}

function sendtoFirebase (nodeName, date, time) {
  let check = db.child(firebaseKey)
  let temparatureData = {
    valueh: humanity,
    valuet: temparature,
    valueswtemp: temparatureSw
  }
  if (check) {
    if(humanity !== "ron" && temparature !== "Wrong"){
      firebase.database().ref('db/'+firebaseKey).update({
        temparature: temparatureData,
      })
    }
    firebase.database().ref('db/'+firebaseKey).update({
      ip: ipNow,
      onlinenow: online
    })
    firebase.database().ref('alive/'+firebaseKey).update({
      nodeName:nodeName,
      alive:true,
      alive2:true
    })
    
  } else {
    let sendData = {
      node: nodeName,
      ip: ipNow,
      onlinenow: online,
      inbound: [{
        value: 0,
        date: date,
        time: time
      }],
      outbound: [{
        value: 0,
        date: date,
        time: time
      }],
      speedtest: [{
        valuedown: download,
        valueup: upload,
        date: date,
        time: time
      }],
      temparature: {
        valueh:0,
        valuet:0,
        valueswtemp:0
      },
      mainlink: {
        in:0,
        out:0
      },
      cpu: 0,
      memory:0,
      utilizein: 0,
      utilizeout:0,
      packetloss: 0,
      alive: true,
      alive2: true

    }
    return new Promise((resolve, reject) => {
      if (!db.push(sendData)) return Promise.reject(new Error('something bad happened'))
      else return resolve(db.push(sendData))
    })
  }
}
// ////////////////////////////////// Getting MIB /////////////////////////////////////////////
function getMIB (nodeName, date, time) {
  let deviceNetwork = new snmp.Session({
    host: nodeNIP
  }) // 10.4.15.1 // 192.168.1.254
  // getInbound
  let inbound = []
  deviceNetwork.getSubtree({
    oid: inboundOID
  }, function (err, letbinds) {
    if (err) {
      console.log(err)
    } else {
      letbinds.forEach((letbind) => {
        //console.log(letbind.oid)
        let data = {
          indexOID: letbind.oid[10],
          inbound: parseInt(letbind.value / 1048576)
        }
        //console.log(data)
        inbound.push(data)
      })
      // console.log(inbound) out commend for checking data
    }
  })
  
  // getOutbound
  let outbound = []
  deviceNetwork.getSubtree({
    oid: outboundOID
  }, function (err, letbinds) {
    if (err) {
      console.log(err)
    } else {
      letbinds.forEach((letbind) => {
        let data = {
          indexOID: letbind.oid[10],
          outbound: parseInt(letbind.value / 1048576)
        }
        outbound.push(data)
      })
      //  console.log(outbound) out commend for checking data
    }
  })
//////////////////////////////////  NEW SECTION ///////////////////////////////
  //getCPUusage
  deviceNetwork.get({
    oid: cpuUsageOID
  }, function (err, letbinds) {
    if (err) {
      console.log(err)
    } else {
        cpu = letbinds[0].value
      // console.log(cpu) //out commend for checking data
    }
  })

   //getMemory
   deviceNetwork.get({
    oid: freeMemoryOID
  }, function (err, letbinds) {
    if (err) {
      console.log(err)
    } else {
        memory = letbinds[0].value / 1048576
       // console.log(memory) // out commend for checking data
    }
  })

   //getTempratureIn
   deviceNetwork.get({
    oid: temparatureOID
  }, function (err, letbinds) {
    if (err) {
      console.log(err)
    } else {
        temparatureSw =  letbinds[0].value
       // console.log(temparatureSw) // out commend for checking data
    }
  })
//////////////////////////////////  NEW SECTION ///////////////////////////////
  // getPacketU
  let packetinU = []
  deviceNetwork.getSubtree({
    oid: packetinUOID
  }, function (err, letbinds) {
    if (err) {
      console.log(err)
    } else {
      letbinds.forEach((letbind) => {
        let data = {
          indexOID: letbind.oid[10],
          pktsinu: letbind.value
        }
        packetinU.push(data)
      })
      //  console.log(packetinU) out commend for checking data
    }
  })

  // getPktsInErr
  let pktsInErr = []
  deviceNetwork.getSubtree({
    oid: pktsInErrOID
  }, function (err, letbinds) {
    if (err) {
      console.log(err)
    } else {
      letbinds.forEach((letbind) => {
        let data = {
          indexOID: letbind.oid[10],
          pktsinerr: letbind.value
        }
        pktsInErr.push(data)
      })
      //  console.log(pktsInErr) out commend for checking data
    }
  })

  // getPktsOutErr
  let pktsOutErr = []
  deviceNetwork.getSubtree({
    oid: pktsOutErrOID
  }, function (err, letbinds) {
    if (err) {
      console.log(err)
    } else {
      letbinds.forEach((letbind) => {
        let data = {
          indexOID: letbind.oid[10],
          pktsouterr: letbind.value
        }
        pktsOutErr.push(data)
      })
      //  console.log(packetinU) out commend for checking data
    }
  })

  let intName = []
  let countInterface = 0
  deviceNetwork.getSubtree({
    oid: intNameOID
  }, function (err, letbinds) {
    if (err) {
      console.log(err)
    } else {
      letbinds.forEach((letbind) => {
        let data = {
          indexOID: letbind.oid[10],
          intName: letbind.value
        }
        intName.push(data)
        if ((letbind.value).toString().toLowerCase().charAt(0) === 'f' || (letbind.value).toString().toLowerCase().charAt(0) === 'g') {
          countInterface++
        }
      })
       //console.log("countInterface = " + countInterface)  // out commend for checking data
    }

    let suminpktU = 0
    let suminpktsErr = 0
    for (let i = 63; i <= 67; i++) {
      sumInbound += inbound[i].inbound
      sumOutbound += outbound[i].outbound
      suminpktU += packetinU[i].pktsinu
      suminpktsErr += pktsInErr[i].pktsinerr
    }
    sumInpkts = suminpktU
    if (sumInpkts !== 0) {
      packetloss = (suminpktsErr / sumInpkts) * 100
    } else {
      packetloss = 0
    }
   // console.log('Sum inbound : ' + sumInbound)
    // console.log('Sum PacketIn :' + sumInpkts)
    // console.log('Packetloss : ' + packetloss)
  })

  let intSpd =  []
  deviceNetwork.getSubtree({
    oid: intSpeed
  }, function (err, letbinds) {
    if (err) {
      console.log(err)
    } else {
      letbinds.forEach((letbind) => {
        let data = {
          indexOID: letbind.oid[10],
          intSpd: letbind.value
        }
        intSpd.push(data)
      })
      //console.log("intspd = " +JSON.stringify(intSpd))  // out commend for checking data
    }
  })

  let check = db.child(firebaseKey)
  if (check) {
    let memoryFree = (memory*100)/128
    let data = {}
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
    setTimeout(() => {   
      let inb =  inbound[64].inbound
      let outb = outbound[64].outbound 
      let mainlinkData = {
        in: inb,
        out: outb
      }
      data = mainlinkData
    }, 3000)

    setTimeout(() => {
      let sumInterface = 0
      for (let i = 64; i <= 67; i++) {
        sumInterface += intSpd[i].intSpd/1048576
      }
      firebase.database().ref().child('db/'+firebaseKey+'/sumInterface').set(sumInterface)
      firebase.database().ref().child('db/'+firebaseKey+'/inbound').push(insertIn)
      firebase.database().ref().child('db/'+firebaseKey+'/outbound').push(insertOut)
      firebase.database().ref().child('db/'+firebaseKey+'/packetloss').set(packetloss)
      firebase.database().ref().child('db/'+firebaseKey+'/mainlink').set(data)
      firebase.database().ref().child('db/'+firebaseKey+'/cpu').set(cpu)
      firebase.database().ref().child('db/'+firebaseKey+'/memory').set(memoryFree)
      firebase.database().ref().child('db/'+firebaseKey+'/iplist').set(iplist)
    }, 9000)
      
   
   
    sumInbound = sumOutbound = sumInpkts = suminpktU = suminpktsErr = 0
  }
  setTimeout(() => {
  //calculateUtilize(countInterface,intSpd,nodeName)
  
  },7000)
}


function speedTest () {
  return new Promise((resolve, reject) => {
    exec('python speedtest-cli | grep \'Download:\\|Upload:\'|cut -d: -f2', {
      cwd: '/project1'
    }, (err, stdout, stderr) => {
      setTimeout(() => {
        if (err) return reject("SpeedTest Error : " + err)
        else resolve(`${stdout}`)
      })
    })
  })
}

function calculateUtilize (countInterface,interfaceSpeed,nodeName) {
  let sumUtilizeIn  = 0
  let sumUtilizeOut = 0
  let sumInterface = 0
  let inbound1 = 0
  let inbound2 = 0
  let outbound1 = 0
  let outbound2 = 0
  

  let data =  dbInfo.find(info => info.node === nodeName)
   inbound1 = data.inbound[data.inbound.length-1].value
   inbound2 = data.inbound[data.inbound.length-2].value
   outbound1 = data.outbound[data.outbound.length-1].value
   outbound2 = data.outbound[data.outbound.length-2].value
  let sumIn = (inbound2 - inbound1)*100
  let sumOut = (outbound2 - outbound1)*100
  sumIn = sumIn/(300*sumInterface)
  sumOut = sumOut/(300*sumInterface)
  sumIn = Math.abs(sumIn) 
  sumOut = Math.abs(sumOut)
  if(isNaN(sumIn)) sumIn = 0
  if(isNaN(sumOut)) sumOut = 0
  firebase.database().ref('db/' + data.id).update({
    utilizein: sumIn,
    utilizeout: sumOut
  })
}

function sendTemparature () {
  return new Promise((resolve, reject) => {
    exec('sudo ./dht', {
      cwd: '/project1'
    }, (err, stdout, stderr) => {
      setTimeout(() => {
        if (err) return reject("get Temparature Error : " + err)
        else resolve(`${stdout}`)
      })
    })
  })
}
/* // Define port number as 3000
const port = 3000
// Routes HTTP GET requests to the specified path "/" with the specified callback function
app.get('/', function (request, response) {
  response.send(ipNow + 'ออนไลน์ user' + online)
})
// Make the app listen on port 3000
app.listen(port, function () {
  console.log('Server listening on http://localhost:' + port)
}) */
