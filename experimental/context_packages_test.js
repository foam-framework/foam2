
Package = {
  
  initObject: function initObject(nameArr, val) {
    console.assert(nameArr.length > 0, "initObject empty name array not allowed");
    var name = nameArr.splice(0,1)[0];
console.log("initObject for", name, val, nameArr);
    if ( this.hasOwnProperty(name) ) 
      return this[name];
console.log("  creating package");    
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
          console.log("  setting property on", this.name_, name, val);    
          
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
    else if ( nameArr.length == 1 ) // the last name part is the property/thing name
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
console.log("  checkObjectProto", this.name_, package_ref.name_);
    this.parent_ && package_ref.parent_ && this.parent_.checkObjectProto(package_ref.parent_);
    var name = this.name_;
    if ( this.__proto__[name] && package_ref.__proto__ !== this.__proto__[name] ) {
      // there's a newly set ancestor in between our old object and us
      package_ref.__proto__ = this.__proto__[name];
    }
  },
  
}

X = Object.create(Package);

X.set = function set(name, val) {
  var nameArr = name.split('.');
  if ( ! this.hasOwnProperty(nameArr[0]) && nameArr.length > 1 ) {
    this.initObject(nameArr, val);
  }
  this[nameArr[0]] = val;
}
//X = {
  // set: function set(name, thing) {
  //   var value_ = thing; // captured in closures to hold the value
  //   var self = this; // to check if we're set from a subcontext
  //   Object.defineProperty(this, name, {
  //     get: function() {
  //       return value_;
  //     },
  //     set: function(val) {
  //       if ( ! ( this === self ) ) {
  //         // create a new set of package passthrough objects on this
  //         this.set(name, val);
  //       } else {
  //         value_ = val;
  //       }
  //     }
  //   });
  //
  //   var parts = name.split('.');
  //   if ( parts.length <= 1 ) return;
  //   // accessors for the package parts
  //   var pkg = this;
  //   for (var i = 0; i < parts.length-1; ++i) {
  //     var part = parts[i];
  //     if ( ! pkg.hasOwnProperty(part) ) {
  //       pkg[part] = this.__proto__ ? Object.create(this.__proto__[part]) : {};
  //     }
  //     pkg = pkg[part];
  //   }
  //   if ( ! pkg[parts[parts.length-1]] ) {
  //     Object.defineProperty(pkg, parts[parts.length-1], {
  //       get: function() {
  //         return value_;
  //       },
  //       set: function(val) {
  //         value_ = val;
  //       }
  //     });
  //   } else {
  //     console.assert(false, "Duplicate definition of "+name)
  //   }
  //
  // },
  
  
  
X.sub = function sub() {
  return Object.create(this);
}


X.set('val', 8);
console.log(X.val);

X.set('package.val', 4);
console.log(X.package.val);
X.package.val = 3;
console.log(X['package.val'], X.package.val);

Y = X.sub();
Y.package.val = 9;
console.log(Y.package.val, X.package.val);