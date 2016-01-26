var GLOBAL = global || this;
function Alpha(a) {
  if (a) {
    this.truthy = true;
  } else {
    this.truthy = false;
  }
}
GLOBAL.Alpha = Alpha;
