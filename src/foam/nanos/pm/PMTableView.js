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

  requires: [ 'foam.nanos.pm.PMInfo', 'foam.u2.view.TableView' ],

  exports: [ 'maxTotalTime' ],

  // Keep standard TableView styling
  constants: { CSS_CLASS: 'foam-u2-view-TableView' },

  css: `
    ^ .foam-u2-ActionView-clearAll { margin-bottom: 10px; }
    ^ .foam-u2-ActionView-create { display: none; }
    ^ .foam-u2-ActionView-edit   { display: none; }
  `,

  properties: [
    {
      class: 'Long',
      name: 'maxTotalTime'
    },
    {
      name: 'contextMenuActions',
      factory: function() {
        return [ this.CLEAR ];
      }
    }
  ],

  methods: [
    function initE() {
      // Next line is a temporary hack to fix CSS loading, otherwise screen
      // is broken if loaded before any tableviews
      this.TableView.create();

      this.addClass('foam-nanos-pm-PMTableView');
      this.startContext({data: this}).add(this.CLEAR_ALL).endContext();
      this.columns_.push([this.CLEAR, null]);

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
      },
      tableWidth: 80
    },
    {
      name: 'clearAll',
      code: function(X) {
        X.pmInfoDAO.removeAll();
        X.pmInfoDAO.select(console);
        this.updateValues = ! this.updateValues;
      }
    }
  ],

  listeners: [
    {
      name: 'updateMax',
      isFramed: true,
      code: function() {
        var self = this;
        this.data.select(this.MAX(this.PMInfo.TOTAL_TIME)).then(function(max) {
          self.maxTotalTime = max.value;
        });
      }
    }
  ]
 });
