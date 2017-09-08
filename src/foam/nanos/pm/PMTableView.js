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

  axioms: [
    foam.u2.CSS.create({code: foam.u2.view.TableView.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  properties: [
    {
      class: 'Long',
      name: 'maxTotalTime'
    }
  ],

  methods: [
    function initE() {
      this.add(this.CLEAR_ALL);

      this.SUPER();

      this.updateMax();
      this.data.listen({reset: this.updateMax, put: this.updateMax});
    }
  ],

  actions: [
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
