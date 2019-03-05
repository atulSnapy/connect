// const functions = require('firebase-functions');
// const firebase = require('firebase');
const {db} = require('./admin');
const express = require('express');
const LatLng = require('./LatLng');



const router = express.Router();



router.get('/:apiKey/:value', (request, response, next) => {
  //input
  const ins = {
    apiKey : request.params.apiKey,
    value: request.params.value,
    valueArr: '',
    valueType: ''
  };

  //validate value?
  const arr = ins.value.split(',');
  if(arr.length === 2) {
    arr.forEach((val) => {
      if(isNaN(val)) {
        const error = new Error('Lat and Lng can be number only');
        return next(error);
      }
    });
    if(arr[0]<-89 || arr[0]>89) {
      const error = new Error('Lat value should be between [-89,89]');
      return next(error);
    }
    if(arr[1]<-179 || arr[1]>179) {
      const error = new Error('Lng value should be between [-179, 179]')
      return next(error);
    }
    ins.valueType = 'loc'
  }
  else if(arr.length === 3) {
    const letters = /^[A-Za-z]+$/;
    arr.forEach((word) =>{
      if(word.match(letters)=== null) {
        const error = new Error('TWA is alphabet only, can not contain anything except aplhabets');
        return next(error);
      }
    });
    ins.valueType = 'twa';
  }
  else {
    const error = new Error(ins.apiKey + "/" + ins.value + " Value Invalid, allowed type 12,12 or one,two,three");
    return next(error);
  }
  ins.valueArr = arr.slice();

  //validate apiKeyLength
  if(ins.apiKey.length !== 7) {
    const error = new Error(ins.apiKey + ' API Key length should be 7, but it is ' + ins.apiKey.length);
    return next(error);
  }

  //check if apiKey exists and valid
  const apiRef = db.collection('api').where('apiKey', '==', ins.apiKey);
  apiRef.get()
  .then((snapshot) => {
    if(snapshot.size === 0) {
      const error = new Error('API Key does not exists');
      return next(error);
    }
    if(snapshot.size > 1) {
      let docIds = '';
      snapshot.forEach((doc) => {
        docIds = docIds + '_' + doc.id + '_';
      });
        console.log('ATUL-LOG', '*apiKey '+ ins.apiKey +' have multiple match*', docIds);
        const error = new Error('SomeERRROR->APIKEY not unique');
        return next(error);
    }
    snapshot.forEach((doc) => {
      const data = doc.data();
      if(data.callsLeft === 0) {
        const error = new Error('API Limit exhausted');
        return next(error);
      }
      doc.ref.update({
        callsLeft: data.callsLeft-1,
        lastAccessed: new Date()
      });
      if(ins.valueType === 'loc') {
        const lat = ins.valueArr[0];
        const lng = ins.valueArr[1];
        const loc = new LatLng(lat, lng);
        const str = "<h1>loc=>("+loc.lat+","+loc.lng+")</h1><h1>fLoc=>("+loc.fLat+","+loc.fLng+")</h1>";
        return response.send(str);
      } 
      if(ins.valueType === 'twa') {
        const twaRef = db.collection('twa').where('name', '==', ins.value);
        twaRef.get()
        .then((twaSnapshot) => {
          if(twaSnapshot.size === 0) {
            const error = new Error('TWA does not exists');
            return next(error);
          }
          if(twaSnapshot.size > 1) {
            let docIds = '';
            twaSnapshot.forEach((twaDoc) => {
              docIds = docIds + '_' + twaDoc.id + '_';
            });
              console.log('ATUL-LOG', '*TWA '+ ins.value +' have multiple match*', docIds);
              const error = new Error('SomeERRROR->TWA not unique');
              return next(error);
          }
          twaSnapshot.forEach((twaDoc) => {
            const twaData = twaDoc.data();
            const str = `
              <br>name = ${twaData.name}
              <br>customName = ${twaData.customName}
              <br>accessed = ${twaData.accessed}
              <br>created = ${twaData.created}
              <br>square.bl = (${twaData.square.bl.latitude},${twaData.square.bl.longitude})
              <br>square.br = (${twaData.square.br.latitude},${twaData.square.br.longitude})
              <br>square.tl = (${twaData.square.tl.latitude},${twaData.square.tl.longitude})
              <br>square.tr = (${twaData.square.tr.latitude},${twaData.square.tr.longitude})
              `;
            return response.send(str);
          });
        })
        .catch((err) => {
          console.log('ATUL-LOG', 'TWA ERROR', err);
          const error = new Error('SomeERROR twa');
          return next(error);
        });
      }
    });

    // let str = '';
    // snapshot.forEach((doc) => {
    //   const data = doc.data();
    //   console.log(doc.id, '=>', data);
    //   str = str + '<br>' + doc.id + '=><br>apiKey=' + typeof data.apiKey + '<br>callsLeft=' + typeof data.callsLeft + '<br>lastAccessed=' + typeof data.lastAccessed;
    // });
    // return response.send('This is data received => <br>' + str);
  })
  .catch((err) => {
    console.log('ATUL-LOG', "API ERROR", err);
    const error = new Error('SomeERROR api');
    return next(error);
  });

});
export = router;
