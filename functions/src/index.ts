const functions = require('firebase-functions');
const firebase = require('firebase');
const {db, firestore} = require('./admin');
const express = require('express');
const LatLng = require('./LatLng');
const apiRoutes = require('./apiRoutes');

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//initialize firebase-admin - used for firestore db
// admin.initializeApp(functions.config().firebase);
// const db = admin.firestore();

// const firestore = firebase.firestore;

// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const app = express();

exports.connectapp = functions.https.onRequest(app);



app.get('/app', (request,response) => {
	response.send("<h1>This is connect</h1>");
});

app.get('/app/welcome', (request, response) => {
	response.send("<h1>welcome welcome welcome</h1>");
});

app.get('/app/normal/:lat/:lng', (request, response) => {
	const lat = parseFloat(request.params.lat);
	const lng = parseFloat(request.params.lng);
  const loc = new LatLng(lat, lng);
	const str = "<h1>loc=>("+loc.lat+","+loc.lng+")</h1><h1>fLoc=>("+loc.fLat+","+loc.fLng+")</h1>";
	response.send(str);
});

app.get('/app/read', (request, response) => {
  let str = "<h1>Hello Reader</h1>";
  db.collection('twa').where('name', '==','one.two.three').get()
  .then((snapshot) => {
    if(snapshot.size === 0) {
      response.send(str + 'snapshot size = 0');
    } else {
      str = str + '<br>snapshot size = ' + snapshot.size;
      snapshot.forEach((doc) => {
        const data = doc.data();
        str = str + '<br>docId = ' + doc.id;
        str = str + '<br>name = ' + data.name;
        str = str + `<br>Word[0] = ${data.words[0]}`;
        str = str + `<br>Word[1] = ${data.words[1]}`;
        str = str + `<br>Word[2] = ${data.words[2]}`;
        str = str + '<br>square.bl = ' + data.square.bl.latitude;
        str = str + '<br>square.tl = ' + data.square.tl.latitude;
        str = str + '<br>square.tr = ' + data.square.tr.latitude;
        str = str + '<br>square.br = ' + data.square.br.latitude;
        str = str + '<br>newTime = ' + data.newTime;
        let acc = data.accessed;
        acc = firestore.Timestamp.fromDate(acc)
        const flag = data.newTime<acc;
        str = str + `<br>newTime &lt; accessed = ${flag}`;
        str = str + '<br>square.accessed = ' + acc;
        str = str + '<br>square.accessedseconds = ' + acc.seconds;

        const up = {
          done: 'I guess 3',
          newTime: firestore.Timestamp.now(),
          newLoc: new firestore.GeoPoint(27.000027, 30.000030)
        };
        doc.ref.update(up);
        str = str + `<br>newNewTimeseconds = ${up.newTime.seconds}`;
      });
      response.send(str);
    }
  })
  .catch((err) => {
    console.log("ERROR READ", err);
    response.send("someerror"+err);
  });
});

//for actual API
app.use('/api', apiRoutes);
// for Errors
app.use((error, req, res, next) => {
  res.json({
		response: 'Error',
		message: error.message
  });
});
