/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.test',
   name: 'TestBorder',
   extends: 'foam.u2.view.ScrollTableView',

   implements: [ 'foam.mlang.Expressions' ],

   requires: [ 'foam.nanos.test.Test' ],

   properties: [
     'status',
     { class: 'Int', name: 'passed' },
     { class: 'Int', name: 'failed' }
   ],

   methods: [
     function initE() {
       this.
         startContext({data: this}).add(this.RUN_ALL, this.RUN_FAILED_TESTS).endContext().
         start('span').style({'padding-left': '12px'}).add('Passed: ', this.passed$).end().
         start('span').style({'padding-left': '12px'}).add('Failed: ', this.failed$).end().
         start('span').style({'padding-left': '12px'}).add('Status: ', this.status$).end();

      this.SUPER();
    },

    function runTests(dao) {
      var self  = this;
      var count = 0;
      var startTime = Date.now();

      this.status = 'Testing...';
      this.passed = this.failed = 0;

      dao.select({
        put: function(t) {
          count++;
          self.status = 'Testing: ' + t.id;
          t.run();
          self.passed += t.passed;
          self.failed += t.failed;
        },
        eof: function() {
          var duration = (Date.now() - startTime) / 1000;
          self.status = count + ' tests run in ' + duration.toFixed(2) + ' seconds';
        }
      });
    }
   ],

   actions: [
     function runAll() {
       this.runTests(this.data);
     },
     function runFailedTests() {
       this.runTests(this.data.where(this.GT(this.Test.FAILED, 0)));
     },
   ]
});
