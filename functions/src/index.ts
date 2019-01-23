const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
const express = require('express');

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

const normalLatLng = (loc) => {


	const toRad = (x) => {
		return x*(Math.PI/180);
	}
	const toDeg = (x) => {
		return x*(180/Math.PI);
	}
	const getMinLat = () => {
		return 0.000027;
	}
	const getMinLng = (lat) => {;
		const rlat = toRad(lat);
		const d = 3.00;
		const r = 6378100;

		const rlng = Math.atan2(Math.sin(d/r)*Math.cos(rlat), Math.cos(d/r)-Math.sin(rlat)*Math.sin(rlat));
		return parseFloat(toDeg(rlng).toFixed(6));
	}

	const fLoc = () => {
		const lat = loc.lat;

		//create fLat (formated lat)
		const minLat = getMinLat(); //to get minLat
		const fLat = minLat*Math.floor(lat/minLat);

		//create fLng (formated lng)
		const minLng = getMinLng(fLat);
		const fLng = minLat*Math.floor(lat/minLng);

		return {lat:fLat, lng:fLng};
	}

	return fLoc();
}

app.get('/', (request,response) => {
	response.send("<h1>This is connect</h1>");
});

app.get('/welcome', (request, response) => {
	response.send("<h1>welcome welcome welcome</h1>");
});

app.get('/normal/:lat/:lng', (request, response) => {
	const lat = parseFloat(request.params.lat);
	const lng = parseFloat(request.params.lng);
	const loc = {'lat':lat,'lng':lng};
	const fLoc = normalLatLng(loc);
	const str = "<h1>("+loc.lat+","+loc.lng+")</h1><h1>("+fLoc.lat+","+fLoc.lng+")</h1>";
	response.send(str);
});

app.get('/read', (request, response) => {
	db.collection('twa').get().then((snapshot) => {
		snapshot.forEach((doc) => {
			response.send(doc.id, '=>', doc.data());
		});
	}).catch((err) => {
		response.send('Error getting documents', err);
	});
  
});