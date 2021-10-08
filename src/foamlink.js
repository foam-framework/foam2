/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// === Files in this section do not contain FOAM models

IGNORE('lib/dao_test.js');
// TODO: when genJava allows: IGNORE('com/google/foam/demos');
IGNORE('com/google/net/proto_gen.js');
IGNORE('foam/demos/tabata/main.js');
IGNORE('com/google/foam/experimental/Promise_test.js');
IGNORE('foam/demos/examples/bench.js');

// these files depend on global objects and should not be loaded by foamlink
IGNORE('foam/demos/u2');

// === Files in this section should be processed by foamlink
//     but cannot be due to code invoked during loading

// depends on instance variable 'this.SomeSpecialType'
MANUAL('test/Foo.js', [
  'test.Foo', 'test.Person',
  'test.Bar', 'test.Address',
  'test.DayOfWeek', 'test.User',
  'test.SomeSpecialType',
  'test.SpecialProperty',
  'test.me.AnEnum',
  'test.FooRefinement'
]);

// foamlink proxy value can't be used as primitive
MANUAL('foam/swift/dao/CachingDAO.js', [
  'foam.swift.dao.CachingDAO'
]);
MANUAL('foam/swift/ui/DAOTableViewSource.js', [
  'foam.swift.ui.DAOTableViewSource.js'
]);
