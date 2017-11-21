/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'PMTableView',
  extends: 'foam.u2.view.TableView',

  documentation: 'TableView for displaying PMInfos.',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [ 'foam.nanos.pm.PMInfo' ],

  exports: [ 'maxTotalTime' ],

  // Keep standard TableView styling
  constants: { CSS_CLASS: 'foam-u2-view-TableView' },

  css: `
    .foam-comics-BrowserView-foam-nanos-pm-PMInfo .foam-u2-ActionView-create { display: none; }
    .foam-comics-BrowserView-foam-nanos-pm-PMInfo .foam-u2-ActionView-edit   { display: none; }
  `,

  properties: [
    {
      class: 'Long',
      name: 'maxTotalTime'
    }
  ],

  methods: [
    function initE() {
      this.add(this.CLEAR_ALL);
      this.columns_.push(this.CLEAR);

      this.SUPER();

      this.updateMax();
      this.data.listen({reset: this.updateMax, put: this.updateMax});
    }
  ],

  actions: [
    {
      name: 'clear',
      code: function(X) {
        X.pmInfoDAO.remove(this);
      }
    },
    {
      name: 'clearAll',
      code: function() {
        this.data.removeAll();
      }
    }
  ],

  listeners: [
    {
      name: 'updateMax',
      isFramed: true,
      code: function() {
        var self = this;
        this.data.select(this.MAX(this.PMInfo.TOTALTIME)).then(function(max) {
          self.maxTotalTime = max.value;
        });
      }
    }
  ]
 });
