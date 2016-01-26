var GLOBAL = global || this;
function Alpha(a) {
  if (a) {
    this.truthy = true;
    if (a.b) {
      this.extraTruthy = true;
    } else {
      this.extraTruthy = false;
    }
  } else {
    this.truthy = this.extraTruthy = false;
  }
}
GLOBAL.Alpha = Alpha;
