// const functions = require('firebase-functions');
// const firebase = require('firebase');
const {db, firestore} = require('./admin');
const express = require('express');
const LatLng = require('./LatLng');
const Dec = require('decimal.js');
const Dictionary = require('./Dictionary');

const router = express.Router();


// to format the response
const processDoc = (data, center) => {
  let loc;
  if(center === "center") {
    const lat = parseFloat(Dec.add(data.square.bl.latitude, data.square.tl.latitude).div(2).toFixed(6));
    const lng = parseFloat(Dec.add(data.square.bl.longitude, data.square.br.longitude).div(2).toFixed(6));
    loc = new firestore.GeoPoint(lat, lng);
  }
  else {
    loc = new firestore.GeoPoint(center.lat, center.lng);
  }


  const jsn ={
    response: 'success',
    message: 'ok',
    data: {
      customtwa: '',
      twa: data.twa[0],
      location: loc,
      square: data.square,
    }
  };
  if(data.custom) {
    jsn.data.customtwa = data.twa[1];
  }
  // const header = "<h1>Connect</h1>";
  // let str = `${header}<br>twa = `;
  // if(data.custom) {
  //   str += `(${data.twa[1]})<=>`;
  // }
  // str += `
  // ${data.twa[0]}
  // <br>loc = (${loc.latitude},${loc.longitude})
  // <br>accessed = ${data.lastaccess}
  // <br>created = ${data.created}
  // <br>square.bl = (${data.square.bl.latitude},${data.square.bl.longitude})
  // <br>square.br = (${data.square.br.latitude},${data.square.br.longitude})
  // <br>square.tl = (${data.square.tl.latitude},${data.square.tl.longitude})
  // <br>square.tr = (${data.square.tr.latitude},${data.square.tr.longitude})
  // `;
  return jsn;
}


// for new Twa creation
const createNewtwa = (response, data, loc) => {
  // console.log("Entering twa", data.twa[0]);
  const words = [Dictionary.getRandomWord(), Dictionary.getRandomWord(), Dictionary.getRandomWord()];
  const twa = words[0]+'.'+words[1]+'.'+words[2];
  // console.log(twa);
  db.collection('addresses').where('twa', 'array-contains', twa).get()
  .then(snapshot => {

    if(snapshot.size > 1) {
        let docIds = '';
        snapshot.forEach((doc) => {
          docIds = docIds + '_' + doc.id + '_';
        });
        console.log('ATUL-LOG', '*TWA '+ twa +' have multiple match*', docIds);
        const error = new Error("Db error m")
        response.next(error);
      }
    if(snapshot.empty) {
      data.twa[0] = twa;
      // console.log("in between ->", data.twa[0]);
      //actual addition of new twa
      db.collection('addresses').add(data)
      .then(ref => {
        // newtwaCreated = true;
        return response.json(processDoc(data, loc));
        console.log("ATUL-LOG New TWA added at", ref.id);
      })
      .catch(err => {
        console.log('ATUL-LOG', 'ERROR FOR ACTUAL TWA ADDITION->', err);
        const error = new Error("Db error");
        response.next(error);
      });
    } else {
      createNewtwa(response, data, loc);
    }
  })
  .catch(err => {
    console.log('ATUL-LOG', 'ERROR FOR TWAEXISTS', err);
    const error = new Error("Db error");
    response.next(error);
  });
}

//route for API
router.get('/:apiKey/:value', (request, response, next) => {
  // CORS
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //input
  const ins = {
    apiKey : request.params.apiKey,
    value: request.params.value,
    valueArr: '',
    valueType: ''
  };

  //validate value?
  let arr = ins.value.split(',');
  console.log("arr-> ", arr);
  if(arr.length === 2) {
    for(let i=0; i<2; i++) {
      arr[i] = arr[i].trim();
      const val = arr[i];
      console.log(val, "isNaN->", isNaN(val));
      if(isNaN(val) || val==="") {
        //when either lat or lng ar not number
        const error = new Error('Invalid latitude or longitude value');
        return next(error);
      }
    }

    if(arr[0]<-89 || arr[0]>89) {
      //when lat is <-89 or >89
      const error = new Error('Lat value should be between [-89,89]');
      return next(error);
    }
    if(arr[1]<-179 || arr[1]>179) {
      //when lng is <-179 or >179
      const error = new Error('Latitude range(-89,89) and Longitude range(-179,179)')
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
      const error = new Error(ins.value + " Value Invalid, allowed type 12,12 or one,two,three");
      return next(error);
    }
  }

  //set valueArr to value (it can be loc or twa)
  ins.valueArr = arr.slice();
  console.log("valueArr->", ins.valueArr);

  //validate apiKeyLength
  if(ins.apiKey.length !== 20) {
    const error = new Error(ins.apiKey + ' API Key length should be 20, but it is ' + ins.apiKey.length);
    return next(error);
  }

  //check if apiKey exists and valid
  // api doc reference
  //for api
  db.collection('apis').doc(ins.apiKey).get()
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

  })
  .catch(err => {
    console.log('ATUL-LOG', 'ERROR FOR API', err);
    const error = new Error('DB ERROR -> '+err);
    return next(error);
  });

  // for value = loc
  if(ins.valueType === 'loc') {
    const lat = ins.valueArr[0];
    const lng = ins.valueArr[1];
    const loc = new LatLng(lat, lng);
    const bl = new firestore.GeoPoint(loc.fLat, loc.fLng);
    db.collection('addresses').where('square.bl', '==', bl).get()
    .then((snapshot) => {
      if(snapshot.empty) {

        const data = {
          created: new Date(),
          custom: false,
          lastaccess: new Date(),
          square: {
            bl: new firestore.GeoPoint(loc.square.bl.lat, loc.square.bl.lng),
            br: new firestore.GeoPoint(loc.square.br.lat, loc.square.br.lng),
            tl: new firestore.GeoPoint(loc.square.tl.lat, loc.square.tl.lng),
            tr: new firestore.GeoPoint(loc.square.tr.lat, loc.square.tr.lng)
          },
          twa: ['i am twa'],
          twacreatoeapi: ins.apiKey
        };
        createNewtwa(response, data, loc);
      }
      if(snapshot.size > 1) {
        let docIds = '';
        snapshot.forEach((doc) => {
          docIds = docIds + '_' + doc.id + '_';
        });
        console.log('ATUL-LOG', '*loc '+ bl.latitude + ',' +bl.longitude +' have multiple match*', docIds);
        const error = new Error('SomeERRROR->loc.bl not unique');
        return next(error);
      }

      //for value = loc
      snapshot.forEach((doc) => {
        doc.ref.update({
          lastaccess: new Date()
        });
        return response.json(processDoc(doc.data(), loc));
      });
    })
    .catch(err => {
      console.log('ATUL-LOG', 'ERROR LOC', err);
      const error = new Error("Db error");
      response.next(error);
    });
  }
  // for value = twa
  if(ins.valueType === 'twa') {
    //get address reference
    db.collection('addresses').where('twa', 'array-contains', ins.value).get()
    .then(snapshot => {
      if(snapshot.empty) {
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
        const error = new Error("Db error m");
        response.next(error);
      }
      // for value = twa
      snapshot.forEach((doc) => {
        doc.ref.update({
          lastaccess: new Date()
        });
        return response.json(processDoc(doc.data(), "center"));
      });
    })
    .catch(err => {
      console.log('ATUL-LOG', 'ERROR TWA', err);
      const error = new Error("Db error");
      response.next(error);
    });
  }
});


export = router;
