// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// const firebase = require('firebase');
const express = require('express');

const router = express.Router();

router.get('/:apiKey/:value', (req, res, next) => {
  //input
  const ins = {
    apiKey : req.params.apiKey,
    value: req.params.value
  };

  //validate value?
  let arr = ins.value.split(',');
  if(arr.length !== 2 && arr.length !== 3) {
    const error = new Error(ins.apiKey + "/" + ins.value + " Value Invalid, allowed type 12,12 or one,two,three")
    return next(error)
  }
  if(arr.length === 2) {
    if(isNaN(arr[0]) || isNaN(arr[1])) {
      const error = new Error(isNaN(arr[0]) + "<-0 1->" + isNaN(arr[1]) + 'Value Invalid')
      return next(error)
    }
  }

  res.send("Value is valid");
});
export = router;
