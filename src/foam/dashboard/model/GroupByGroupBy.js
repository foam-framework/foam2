/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.model',
  name: 'GroupByGroupBy',
  extends: 'foam.dashboard.model.Visualization',
  requires: [
    'foam.mlang.sink.Count',
    'foam.mlang.sink.GroupBy',
    'foam.dashboard.view.Pie',
    'foam.dashboard.view.Table',
    'foam.dashboard.view.Line',
    'foam.dashboard.view.Bar',
    'foam.u2.ContextSensitiveDetailView as DetailView'
  ],
  properties: [
    {
      class: 'String',
      name: 'arg1'
    },
    {
      class: 'String',
      name: 'arg2'
    },
    {
      name: 'views',
      factory: function() {
        return [
          [ this.Bar, 'Bar', ],
          [ this.Line, 'Line' ],
          [ this.DetailView, 'Configure' ]
        ]
      }
    },
    {
      name: 'sink',
      expression: function(arg1, arg2, dao) {
        if ( ! dao ) return null;

        var of = dao.of;
        if ( ! of ) return null;

        var arg1Prop = of.getAxiomByName(arg1);
        if ( ! arg1Prop ) return null;

        var arg2Prop = of.getAxiomByName(arg2);
        if ( ! arg2Prop ) return null;

        return this.GroupBy.create({
          arg1: arg1Prop,
          arg2: this.GroupBy.create({
            arg1: arg2Prop,
            arg2: this.Count.create()
          })
        });
      }
    }
  ]
});

