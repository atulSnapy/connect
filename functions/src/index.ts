const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
const express = require('express');
const LatLng = require('./LatLng');

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//initialize firebase-admin - used for firestore db
admin.initializeApp(functions.config().firebase);
let db = admin.firestore();


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
	db.collection('twa').get().then((snapshot) => {
		response.send(snapshot);
	}).catch((err) => {
		response.send('Error getting documents', err);
	});

});
