const functions = require('firebase-functions');
const firebase = require('firebase');
const {db} = require('./admin');
const express = require('express');
const LatLng = require('./LatLng');
const apiRoutes = require('./apiRoutes');

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//initialize firebase-admin - used for firestore db
// admin.initializeApp(functions.config().firebase);
// const db = admin.firestore();


exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

const app = express();

exports.connectapp = functions.https.onRequest(app);



app.get('/', (request,response) => {
	response.send("<h1>This is connect</h1>");
});

app.get('/welcome', (request, response) => {
	response.send("<h1>welcome welcome welcome</h1>");
});

app.get('/normal/:lat/:lng', (request, response) => {
	const lat = parseFloat(request.params.lat);
	const lng = parseFloat(request.params.lng);
  const loc = new LatLng(lat, lng);
	const str = "<h1>loc=>("+loc.lat+","+loc.lng+")</h1><h1>fLoc=>("+loc.fLat+","+loc.fLng+")</h1>";
	response.send(str);
});

app.get('/read', (request, response) => {
	db.collection('api').get()
  .then((snapshot) => {
    let str = '';
		snapshot.forEach((doc) => {
      // console.log(doc.id, '=>', doc.data());
      const data = doc.data();
      str = str + '<br>' + doc.id + ' => <br>apiKey=' + data.apiKey + '<br>callsLeft=' + data.callsLeft + '<br>lastAccessed='+ data.lastAccessed;
    });
    response.send(str);
	})
  .catch((err) => {
    //console.log('Error getting documents', err);
		response.send('Error getting documents', err);
	});

});

//for actual API
app.use('/api', apiRoutes);
app.use((error, req, res, next) => {
  res.json({
    error: {
      message: error.message
    }
  });
});
