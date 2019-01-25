const Dec = require('decimal.js');

class LatLng {
  //lat and lng
  lat;lng;
  //formated lat an lng
  fLat;fLng;
  //minimum lat and minimum lng
  minLat;minLng;
  //
  static pi = Dec.acos(-1);
  constructor(lat,lng) {
    this.lat = Dec(lat);
    this.lng = Dec(lng);
    this.formateLoc();
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
}

export = LatLng;
// const loc = new LatLng(12,12);
// console.log("lat", loc.lat.toString());
// console.log("lng", loc.lng.toString());
// console.log("fLat", loc.fLat.toString());
// console.log("fLng", loc.fLng.toString());
