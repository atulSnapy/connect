const Dec = require('decimal.js');

class LatLng {
  //lat and lng
  lat;lng;
  //formated lat an lng
  fLat;fLng;
  //minimum lat and minimum lng
  minLat;minLng;
  //square
  square = {
    bl:{lat:0,lng:0},
    br:{lat:0,lng:0},
    tl:{lat:0,lng:0},
    tr:{lat:0,lng:0},
    center:{lat:0,lng:0},
    center2:{lat:0,lng:0}
  };
  static pi = Dec.acos(-1);
  constructor(lat,lng) {
    this.lat = Dec(lat);
    this.lng = Dec(lng);
    this.formateLoc();
    this.calculateSquarePoints();
    this.toFloat();
  }

  //convert degree to radian
  static toRad(x) {
    return x.mul(LatLng.pi.div(Dec(180)));
  }
  //convert radian to degree
  static toDeg(x) {
    return  x.mul(Dec(180).div(LatLng.pi));
  }
  //to get minLat
  static getMinLat() {
    return Dec(0.000027);
  }
  //to get minLng
  static getMinLng(lat) {
    const rlat = LatLng.toRad(lat);
    const d = Dec(3.00);
    const r = Dec(6378100);

    const rlng = Dec.atan2(Dec.sin(d.div(r)).times(Dec.cos(rlat)),Dec.cos(d.div(r)).minus(Dec.sin(rlat).pow(2)));
    const lng = LatLng.toDeg(rlng);
    return Dec(lng.toFixed(6));
  }
  //to generate fLoc
  formateLoc() {
    this.minLat = LatLng.getMinLat();
    this.fLat = this.minLat.mul(Dec.floor(this.lat.div(this.minLat)));
    this.minLng = LatLng.getMinLng(this.fLat);
    this.fLng = this.minLng.mul(Dec.floor(this.lng.div(this.minLng)));
  }

  calculateSquarePoints() {
    this.square.bl.lat = this.fLat;
    this.square.bl.lng = this.fLng;

    this.square.br.lat = this.fLat;
    this.square.br.lng = this.fLng.plus(this.minLng);

    this.square.tl.lat = this.fLat.plus(this.minLat);
    this.square.tl.lng = this.fLng;

    this.square.tr.lat = this.fLat.plus(this.minLat);
    this.square.tr.lng = this.fLng.plus(this.minLng);

    this.square.center.lng = this.fLng.plus(this.minLng.div(2));
    this.square.center.lat = this.fLat.plus(this.minLat.div(2));


    this.square.center2.lat = Dec.add(this.square.bl.lat, this.square.tl.lat).div(2);
    this.square.center2.lng = Dec.add(this.square.bl.lng, this.square.br.lng).div(2);
  }
  toFloat() {
    this.lat = parseFloat(this.lat.toString());
    this.lng = parseFloat(this.lng.toString());

    this.minLat = parseFloat(this.minLat.toString());
    this.minLng = parseFloat(this.minLng.toString());

    this.fLat = parseFloat(this.fLat.toString());
    this.fLng = parseFloat(this.fLng.toString());


    this.square.bl.lat = parseFloat(this.square.bl.lat.toString());
    this.square.bl.lng = parseFloat(this.square.bl.lng.toString());

    this.square.br.lat = parseFloat(this.square.br.lat.toString());
    this.square.br.lng = parseFloat(this.square.br.lng.toString());

    this.square.tl.lat = parseFloat(this.square.tl.lat.toString());
    this.square.tl.lng = parseFloat(this.square.tl.lng.toString());

    this.square.tr.lat = parseFloat(this.square.tr.lat.toString());
    this.square.tr.lng = parseFloat(this.square.tr.lng.toString());

    this.square.center.lat = parseFloat(this.square.center.lat.toString());
    this.square.center.lng = parseFloat(this.square.center.lng.toString());

    this.square.center2.lat = parseFloat(this.square.center2.lat.toString());
    this.square.center2.lng = parseFloat(this.square.center2.lng.toString());

  }
}

export = LatLng;
// const loc = new LatLng(12,45);
// console.log("lat", loc.lat);
// console.log("lng", loc.lng);
// console.log("fLat", loc.fLat);
// console.log("fLng", loc.fLng);
//
// // console.log("SQUARE\n\n");
//
// // console.log(loc.square.tl.lat,',',loc.square.tl.lng,'------',loc.square.tr.lat,',',loc.square.tr.lng);
// // console.log('           |                                |');
// // console.log('           |                                |');
// // console.log('           |                                |');
// // console.log(loc.square.bl.lat,',',loc.square.bl.lng,'------',loc.square.br.lat,',',loc.square.br.lng);
//
// console.log("CENTER");
// console.log(loc.square.center.lat, loc.square.center.lng)
// console.log(loc.square.center2.lat, loc.square.center2.lng)
