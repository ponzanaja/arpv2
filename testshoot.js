const firebase = require('firebase')
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
let insertIn = {
  value: 7522,
  date: '19/12/2018',
  time: '09:12'
}
firebase.database().ref('db/-L46xegEleuKcTnJXDjg/inbound').push(insertIn)