# Porting from FOAM1 to FOAM2

Replace CLASS() with foam.CLASS().
Replace model_: with class: in JSON.
Replace lazyFactory: with factory:. FOAM1 supported both eager and lazy factories, but in FOAM2 all factories are lazy (ie. value is generated only when first accessed).
Replace defaultValueFn: with expression: (which has different semantics but can serve the same purpose).
Replace defaultValue: with just value:
FOAM2 only supports the U2 library, not U1 (ie. foam.ui.*).
FOAM2 does not extend built-in prototypes, instead use foam.* static functions. See stdlib.js.
Replace traits: with implements:.
Replace addListener() with sub().
Replace removeListener with unsub(), or better, sub() now returns a "destroyable" which can be saved and used to cancel the subscription more efficiently.  See test/browser/FOAMByExample.html for usage.
Replace "isMerged: 1000" with "isMerged: true, mergeDelay: 1000".
Action.isEnabled and isAvailable is different.
"Values" have been renamed "Slots".
getPropertyValue() has been renamed slot() and made more general.
Methods from Events.* are now methods on Slots.
The DAO interface is now Promise based.
CSS is now specified as a CSS Axiom, rather than as a template named CSS:
  axioms: [
    foam.u2.CSS.create({
      code: function() {/*
      ^ {
        border: 1px solid gray;
        display: table-cell;
        font-weight: bold;
        height: 26px;
        text-align: center;
        vertical-align: middle;
        width: 26px;
      }
      */}
    })
  ],
Support for specifying methods: or listeners: as maps ({}) is no longer supported. They must be specified as arrays ([]) in FOAM2.
U2 renames cls() to cssClass().
The use of 'subType' or 'model' to specify types being used in compound property types or in DAO's or Views have been replaced by 'of'.
The signature of property-change events have changed.
In U2, 'onKeyMode' is renamed to just 'onKey'
U2 no longer takes functions direction for use as dynamic values.  Instead, use obj.slot(fn[, slots]). 
