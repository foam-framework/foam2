/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.test',
  name: 'TestBorder',
  extends: 'foam.u2.view.ScrollTableView',

  implements: ['foam.mlang.Expressions'],

  requires: ['foam.nanos.test.Test'],

  css: `
    ^ > span, ^ .buttons .foam-u2-ActionView {
      margin: 0 10px 10px 0;
    }
  `,

  properties: [
    'status',
    { class: 'Int', name: 'total' },
    { class: 'Int', name: 'passed' },
    { class: 'Int', name: 'failed' }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('span')
          .addClass('buttons')
          .startContext({ data: this })
            .add(this.RUN_ALL, this.RUN_FAILED_TESTS)
          .endContext()
        .end()
        .start('span').add('Total: ', this.total$).end()
        .start('span').add('Passed: ', this.passed$).end()
        .start('span').add('Failed: ', this.failed$).end()
        .start('span').add('Status: ', this.status$).end();

      this.SUPER();

      var self = this;
      this.data.select({
        put: function(t) {
          if ( t && t.enabled ) {
            self.total += 1;
          }
        }
      });
    },

    function runTests(dao) {
      var self = this;
      var startTime = Date.now();

      this.status = 'Testing...';
      this.passed = this.failed = 0;

      dao.select({
        put: function(t) {
          self.status = 'Testing: ' + t.id;
          try {
            t.run();
            self.passed += t.passed;
            self.failed += t.failed;
          } catch (e) {
            console.error('Failed testing', t.id, e);
            self.failed += 1;
          }
        },
        eof: function() {
          var duration = (Date.now() - startTime) / 1000;
          self.status = `${self.passed + self.failed} tests run in ${duration.toFixed(2)} seconds`;
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
