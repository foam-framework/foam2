/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.test',
   name: 'TestBorder',
   extends: 'foam.u2.Controller',

   properties: [
     'status',
     { class: 'Int', name: 'passed' },
     { class: 'Int', name: 'failed' },
     { class: 'foam.dao.DAOProperty', name: 'data' }
   ],

   methods: [
     function initE() {
       this.SUPER();

       this.
         add(this.RUN_ALL).
         start('span').style({'padding-left': '12px'}).add('Passed: ', this.passed$).end().
         start('span').style({'padding-left': '12px'}).add('Failed: ', this.failed$).end().
         start('span').style({'padding-left': '12px'}).add('Status: ', this.status$).end().
         tag({class: 'foam.u2.view.TableView', data: this.data});
     }
   ],

   actions: [
     function runAll() {
       var self  = this;
       var count = 0;
       var startTime = Date.now();

       this.status = 'Testing...';
       this.passed = this.failed = 0;

       this.data.select({
         put: function(t) {
           count++;
           self.status = 'Testing: ' + t.id;
           t.run();
           self.passed += t.passed;
           self.failed += t.failed;
           console.log(t.stringify());
         },
         eof: function() {
           var duration = Math.round((Date.now() - startTime) / 1000);
           self.status = count + ' tests run in ' + duration + ' seconds';
         }
       });
     }
   ]
});
