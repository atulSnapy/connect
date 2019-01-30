// const functions = require('firebase-functions');
// const firebase = require('firebase');
const {db} = require('./admin');
const express = require('express');



const router = express.Router();



router.get('/:apiKey/:value', (request, response, next) => {
  //input
  const ins = {
    apiKey : request.params.apiKey,
    value: request.params.value,
    valueType: ''
  };

  //validate value?
  const arr = ins.value.split(',');
  if(arr.length === 2) {
    if(isNaN(arr[0]) || isNaN(arr[1])) {
      const error = new Error(isNaN(arr[0]) + "<-0 1->" + isNaN(arr[1]) + 'Value Invalid');
      return next(error);
    } else {
      ins.valueType = 'loc';
    }
  }
  else if(arr.length === 3) {
    ins.valueType = 'twa';
  }
  else {
    const error = new Error(ins.apiKey + "/" + ins.value + " Value Invalid, allowed type 12,12 or one,two,three");
    return next(error);
  }
  ins.value = arr;

  //validate apiKeyLength
  if(ins.apiKey.length !== 7) {
    const error = new Error(ins.apiKey + ' API Key length should be 7, but it is ' + ins.apiKey.length);
    return next(error);
  }

  //check if apiKey exists and valid
  const apiRef = db.collection('api').where('apiKey', '==', ins.apiKey);
  apiRef.get()
  .then((snapshot) => {
    if(snapshot.size !== 1) {
      if(snapshot.size === 0) {
        const error = new Error('API Key do not exists');
        return next(error);
      } else {
        //when apiKey have multiple matchs
        let docIds = '';
        snapshot.forEach((doc) => {
          docIds = docIds + '_' + doc.id + '_';
        });
        console.log('ATUL-LOG', '*apiKey '+ ins.apiKey +' have multiple match*', docIds);
        const error = new Error('SomeERRROR->APIKEY not unique');
        return next(error);
      }
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
      return response.send('<h1>Good everything done</h1>');
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
    console.log("ERROR", err);
    const error = new Error('SomeERRROR');
    return next(error);
  });

});
export = router;
