// Initialize Firebase
(function() {
  var config = {
    apiKey: "AIzaSyCCu48q6MHZf5jf4tdgyCyxxt-DjUm8CiE",
    authDomain: "connectsfast.firebaseapp.com",
    databaseURL: "https://connectsfast.firebaseio.com",
    projectId: "connectsfast",
    storageBucket: "connectsfast.appspot.com",
    messagingSenderId: "739863222981"
  };
  firebase.initializeApp(config);

  // firebase.auth().onAuthStateChanged(firebaseUser => { });
})();

// for mapbox
(function() {
  // p
  mapboxgl.accessToken = 'pk.eyJ1IjoiYXR1bHlhZGF2NzA5NiIsImEiOiJjamtyOTV6d2QzZ2k3M2xxaDkyZ3h1aHM2In0.IZNdayP_bLeSe2xpG0wq_g';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v10',
    center: [72.601199,23.006121],
    zoom: 17
  });


  // Add geolocate control to the map.
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  }));

  map.on('mousedown', function(e) {
    map.longPressTime = new Date();
    map.longPressCenter = map.getCenter();
  });
  map.on('mouseup', function(e) {
    dely = new Date() - map.longPressTime;
    newCenter = map.getCenter();
    if(dely>=300 && dely<=1000 && newCenter == map.longPressCenter) {
      // alert("okay");
      callAPI({lat: e.lngLat.lat, lng: e.lngLat.lng});
      // alert("noky");
    }
  });

  // write in Box
  function writeTwa(twa) {
    words = twa.split('.');
    document.getElementById('word1').innerHTML = words[0];
    document.getElementById('word2').innerHTML = words[1];
    document.getElementById('word3').innerHTML = words[2];
  }
  function readTwa() {
    twa = document.getElementById('word1').innerHTML;
    twa += '.'+document.getElementById('word2').innerHTML;
    twa += '.'+document.getElementById('word3').innerHTML;
    return twa;
  }
  function drawPloy(data) {
    sq = data.square;
    oldLayer = readTwa();
    map.setLayoutProperty(oldLayer, 'visibility', 'none');
    map.addLayer({
      'id': data.twa,
      'type': 'fill',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': [[
              [sq.bl._longitude, sq.bl._latitude],
              [sq.br._longitude, sq.br._latitude],
              [sq.tr._longitude, sq.tr._latitude],
              [sq.tl._longitude, sq.tl._latitude],
              [sq.bl._longitude, sq.bl._latitude]
            ]]
          }
        }
      },
      'layout': {},
      'paint': {
        'fill-color': '#088',
        'fill-opacity': 0.8
      }
    });
    writeTwa(responseinJSON.data.twa);
    map.setCenter([data.location._longitude, data.location._latitude]);
    map.setZoom(19);
  }
  // API call
  function callAPI(data) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState==4 && this.status==200) {
        console.log(this.responseText);
        response = this.responseText;
        responseinJSON = JSON.parse(response);
        drawPloy(responseinJSON.data);
        // console.log(square);
      }
    };
    xhttp.open("GET", "https://connectsfast.firebaseapp.com/api/UZs3DI46VhowB3D8q3FJ/"+data.lat+','+data.lng, true);
    xhttp.send();
  }
})();

(function() {
  var form = document.getElementById('loginForm');
  var email = document.getElementById('uname');
  var pass = document.getElementById('pass');
  var loggedin = document.getElementsByClassName('for-loggedin');
  var loggedout = document.getElementsByClassName('for-loggedout');
  var loginModalCloseBtn = document.getElementById('loginModalCloseBtn');

  var loginBtn = document.getElementById('loginBtn');
  var signupBtn = document.getElementById('signupBtn');
  var logoutBtn = document.getElementById('logoutBtn');
  // login
  loginBtn.addEventListener('click', function(event) {
    if (form.checkValidity() === false) {
      console.log("not login")
    } else {
      firebase.auth().signInWithEmailAndPassword(email.value, pass.value)
      .catch(e => {console.log(e.message);});
    }
    form.classList.add('was-validated');
  });

  // signup
  signupBtn.addEventListener('click', function(event) {
    if (form.checkValidity() === false) {
      console.log("not signup");
    } else {
      firebase.auth().createUserWithEmailAndPassword(email.value, pass.value)
      .catch(e => {console.log(e.message)});
    }
    form.classList.add('was-validated');
  });

  //logout
  logoutBtn.addEventListener('click', function(event) {
    
    firebase.auth().signOut();
  });

  //on auth state chanage
  firebase.auth().onAuthStateChanged(firebaseUser => {
    loginModalCloseBtn.click();
    if(firebaseUser) {
      console.log(firebaseUser);
      console.log("Logged in");
      for(var i=0; i<loggedin.length; i++) {
        loggedin[i].classList.remove('d-none');
      }
      for(var i=0; i<loggedout.length; i++) {
        loggedout[i].classList.add('d-none');
      }
    } else {
      console.log("Logged out");
      for(var i=0; i<loggedin.length; i++) {
        loggedin[i].classList.add('d-none');
      }
      for(var i=0; i<loggedout.length; i++) {
        loggedout[i].classList.remove('d-none');
      }
    }
  });
})();