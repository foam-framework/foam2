/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'Lock',

  static: [
    function test__() {
      var lock = foam.core.Lock.create();

      /*
      // Wihtout Locking
      for ( let i = 0 ; i < 10 ; i++ ) {
        setTimeout(function() {
          console.log('start task ' + i);
          setTimeout(function() { console.log('end task ' + i); }, Math.random()*1000);
        }, 0);
      }
      */

      // With Locking
      for ( let i = 0 ; i < 10 ; i++ ) {
        lock.then(function() {
          return new Promise(function (resolve) {
            console.log('start locked task ' + i);
            setTimeout(function() { console.log('end locked task ' + i); resolve(); }, Math.random()*1000);
          });
        });
      }
    }
  ],

  documentation: 'A binary Semaphore / Lock.',

  properties: [
    {
      name: 'promise',
      factory: function() { return Promise.resolve(); }
    }
  ],

  methods: [
    function then(resolve) {
      this.promise = this.promise.then(resolve);
    }
  ]
});
