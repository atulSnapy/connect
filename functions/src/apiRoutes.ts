// const functions = require('firebase-functions');
// const firebase = require('firebase');
const {db} = require('./admin');
const express = require('express');
const LatLng = require('./LatLng');



const router = express.Router();


//route for API
router.get('/:apiKey/:value', (request, response, next) => {
  //input
  const ins = {
    apiKey : request.params.apiKey,
    value: request.params.value,
    valueArr: '',
    valueType: ''
  };

  //validate value?
  let arr = ins.value.split(',');
  if(arr.length === 2) {
    arr.forEach((val) => {
      if(isNaN(val)) {
        //when either lat or lng ar not number
        const error = new Error('Lat and Lng can be number only');
        return next(error);
      }
    });
    if(arr[0]<-89 || arr[0]>89) {
      //when lat is <-89 or >89
      const error = new Error('Lat value should be between [-89,89]');
      return next(error);
    }
    if(arr[1]<-179 || arr[1]>179) {
      //when lng is <-179 or >179
      const error = new Error('Lng value should be between [-179, 179]')
      return next(error);
    }
    //setting value type as "loc"
    ins.valueType = 'loc'
  }
  else {
    arr = ins.value.split('.');
    if(arr.length === 3) {
      const letters = /^[A-Za-z]+$/;
      arr.forEach((word) =>{
        if(word.match(letters)=== null) {
          //if twa contain anything except alphabets
          const error = new Error('TWA is alphabet only, can not contain anything except aplhabets');
          return next(error);
        }
      });
      //set value as "twa"
      ins.valueType = 'twa';
    }
    else {
      //when both twa and loc check fail
      const error = new Error(ins.apiKey + "/" + ins.value + " Value Invalid, allowed type 12,12 or one,two,three");
      return next(error);
    }
  }

  //set valueArr to value (it can be loc or twa)
  ins.valueArr = arr.slice();

  //validate apiKeyLength
  if(ins.apiKey.length !== 20) {
    const error = new Error(ins.apiKey + ' API Key length should be 20, but it is ' + ins.apiKey.length);
    return next(error);
  }

  //check if apiKey exists and valid
  // api doc reference
  db.collection('apis').doc(ins.apiKey).get()
  // for api
  .then(doc =>  {
    if(!doc.exists) {
      // when we do not get any doc i.e. apiKey dows not exists
      const error = new Error('API Key does not exists');
      return next(error);
    }
    const data = doc.data();
    if(data.callsleft === 0) {
      //when no calls are left
      const error = new Error('API Limit exhausted');
      return next(error);
    }
    if(!data.active){
      //when api is not active
      const error = new Error('API has been disabled');
      return next(error);
    }
    doc.ref.update({
      //reduce callsleft counter
      callsleft: data.callsleft-1,
      lastaccess: new Date()
    });
    if(ins.valueType === 'loc') {
      const lat = ins.valueArr[0];
      const lng = ins.valueArr[1];
      const loc = new LatLng(lat, lng);
      const str = "<h1>loc=>("+loc.lat+","+loc.lng+")</h1><h1>fLoc=>("+loc.fLat+","+loc.fLng+")</h1>";
      return response.send(str);
    }

    if(ins.valueType === 'twa') {
      //get address reference
      return db.collection('addresses').where('twa', '==', ins.value).get();
    }
  })
  // for twa = value
  .then((snapshot) => {
    if(snapshot.size === 0) {
      //when twa does not exists
      return db.collection('addresses').where('customtwa', '==', ins.value).get();
      // const error = new Error('TWA does not exists');
      // return next(error);
    }
    if(snapshot.size > 1) {
      let docIds = '';
      snapshot.forEach((doc) => {
        docIds = docIds + '_' + doc.id + '_';
      });
      console.log('ATUL-LOG', '*TWA '+ ins.value +' have multiple match*', docIds);
      const error = new Error('SomeERRROR->TWA not unique');
      return next(error);
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      let str = `<br>twa = ${data.twa}`;
      if(data.custom) {
        str += `(${data.customtwa})`;
      }
      str += `
      <br>accessed = ${data.lastaccess}
      <br>created = ${data.created}
      <br>square.bl = (${data.square.bl.latitude},${data.square.bl.longitude})
      <br>square.br = (${data.square.br.latitude},${data.square.br.longitude})
      <br>square.tl = (${data.square.tl.latitude},${data.square.tl.longitude})
      <br>square.tr = (${data.square.tr.latitude},${data.square.tr.longitude})
      `;
      return response.send(str);
    });
  })
  // for customtwa = value
  .then((snapshot) => {
    if(snapshot.size === 0) {
      //when twa does not exists
      const error = new Error('TWA does not exists');
      return next(error);
    }
    if(snapshot.size > 1) {
      let docIds = '';
      snapshot.forEach((doc) => {
        docIds = docIds + '_' + doc.id + '_';
      });
      console.log('ATUL-LOG', '*TWA '+ ins.value +' have multiple match*', docIds);
      const error = new Error('SomeERRROR->TWA not unique');
      return next(error);
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const str = `<br>twa = ${data.customtwa}(${data.twa})
      <br>accessed = ${data.lastaccess}
      <br>created = ${data.created}
      <br>square.bl = (${data.square.bl.latitude},${data.square.bl.longitude})
      <br>square.br = (${data.square.br.latitude},${data.square.br.longitude})
      <br>square.tl = (${data.square.tl.latitude},${data.square.tl.longitude})
      <br>square.tr = (${data.square.tr.latitude},${data.square.tr.longitude})
      `;
      return response.send(str);
    });
  })
  .catch(err => {
    console.log('ATUL-LOG', 'ERROR', err);
    const error = new Error('DB ERROR');
    return next(error);
  });
});
export = router;
