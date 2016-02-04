/**
 * Experimental support for javascript object-like packages in contexts.
 * Package objects are read only. Set new values on the context:
 *   X.set('my.package.value', 3);
 *   Y = X.sub();
 *   Y.package.value ==> 3
 *   Y.set('package.value2', 7);
 *   Y.package.value2 ==> 7
 *   X.package.value2 ==> undefined
 *   X.package.value = 5;
 *   Y.package.value ==> 5
 */

Package = {
  
  initObject: function initObject(nameArr, val) {
    console.assert(nameArr.length > 0, "initObject empty name array not allowed");
    var name = nameArr.splice(0,1)[0];
//console.log("initObject for", name, val, nameArr);
    if ( this.hasOwnProperty(name) ) {
      if ( nameArr.length > 1 )
        this[name].initObject(nameArr, val);
      else if ( nameArr.length == 1 )
        this[name].set(nameArr[0], val);
      else
        this[name] = val;
      return;
    }
//console.log("  creating package");    
    // package_ holds the actual sub-object, captured by closures, 
    // including the property's getter, below.
    var package_ = this.__proto__[name] ? 
      { // extend an ancestor's copy
         __proto__: this.__proto__[name], 
        parent_: this,
        name_: name
      }  
    : { // initial object
        __proto__: Package,
        parent_: this,
        name_: name,
        set: function set(name, val) {
//console.log("  setting property on", this.name_, name, val);    
          
          this.checkObjectProto(package_); // recursively checks our parents
          // TODO: if there is a package in name, recursively create packages
          //create the property
          if ( ! this.hasOwnProperty(name) ) {
            // this is a regular item in a package, not a sub-package, so
            // allow normal access to the value.
            var value_ = val;
            Object.defineProperty(this, name, {
              get: function get() { return value_; },
              set: function set(val) { value_ = val; }
            });
          }
        } 
      };
  
    // getter for package sub-object. Setting is not allowed. We might change
    // the package object's proto at a future point.
    Object.defineProperty(this, name, {
      get: function get() {
        this.checkObjectProto(package_);
        return package_;
      },
    });
    // if it wasn't our parent's copy, we need to check on each access whether the parent
    // had the object set on it. In that case change the proto chain for our copy of the object.
        
    if ( nameArr.length > 1 ) // initial parts are package names
      package_.initObject(nameArr, val);
    else if ( nameArr.length == 1 ) // the last name part is the property/thing name (dupe of earlier check?)
      package_.set(nameArr[0], val);
      
  },
  
  /** Checks for newly set objects that match our name, in our prototype chain.
      If an ancestor has had one added, use the nearest one as the package object's
      new proto. 
      Example: Contexts X > Y > Z
        X.set('thing.one'), Z.set('thing.two')... X.thing > Z.thing
        Y.set('thing.three')... X.thing > Y.thing > Z.thing (after checkObjectProto)
    */
  checkObjectProto: function checkObjectProto(package_ref) {
//console.log("  checkObjectProto", this.name_, package_ref.name_);
    this.parent_ && package_ref.parent_ && this.parent_.checkObjectProto(package_ref.parent_);
    var name = package_ref.name_;
    var protoPkg = this.__proto__[name];
    if ( protoPkg && package_ref.__proto__ !== protoPkg && package_ref !== protoPkg ) {
      // there's a newly set ancestor in between our old object and us
      package_ref.__proto__ = protoPkg;
    }
  },
  
}

X = Object.create(Package);

X.set = function set(name, val) {
  var nameArr = name.split('.');
  if ( nameArr.length > 1 ) {
    this.initObject(nameArr, val);
  } else {
    this[nameArr[0]] = val;
  }
}
    
X.sub = function sub() {
  return Object.create(this);
}
///////////////////////
var t = Date.now();
Y = X.sub();
Z = Y.sub();

for (var i=0; i<100; ++i) {
  var name = "package.Xprop"+i;
  X.set(name, i);
}

for (var i=200; i<300; ++i) {
  var name = "package.Zprop"+i;
  Z.set(name, i);
}

for (var i=100; i<200; ++i) {
  var name = "package.Yprop"+i;
  Y.set(name, i);
}


console.log("Time(ms): ", Date.now() - t);

