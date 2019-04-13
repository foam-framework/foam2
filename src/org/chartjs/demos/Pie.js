/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs.demos',
  name: 'Pie',
  requires: [
    'foam.dao.EasyDAO',
    'foam.graphics.CView',
    'foam.graphics.EasyPieGraph',
    'foam.graphics.PieGraph2',
    'foam.graphics.PieGraphLabels',
    'foam.u2.DetailView',
    'org.chartjs.Pie',
  ],
  implements: [
    'foam.mlang.Expressions',
  ],
  properties: [
    {
      class: 'Boolean',
      name: 'autoAdd',
      postSet: function() { this.maybeAdd() },
    },
    {
      name: 'bar',
      view: {
        class: 'org.chartjs.demos.ConfigurableChartView',
        view: 'org.chartjs.Bar',
      },
      factory: function() {
        var sink = this.GROUP_BY(this.Person.NAME, this.COUNT());
        this.dao.listen(sink);
        return sink;
      },
    },
    {
      name: 'pie',
      view: {
        class: 'org.chartjs.demos.ConfigurableChartView',
        view: 'org.chartjs.Pie',
      },
      factory: function() {
        var sink = this.GROUP_BY(this.Person.NAME, this.COUNT());
        this.dao.listen(sink);
        return sink;
      },
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      factory: function() {
        return this.EasyDAO.create({
          of: this.Person,
          daoType: 'MDAO',
          seqNo: true,
        });
      },
    },
  ],
  classes: [
    {
      name: 'Person',
      properties: [
        { name: 'id' },
        { class: 'String', name: 'name' },
        { class: 'String', name: 'sex', value: 'M' },
        { class: 'Int', name: 'age' },
      ]
    },
  ],
  listeners: [
    {
      name: 'maybeAdd',
      isMerged: true,
      mergeDelay: 500,
      code: function() {
        if ( ! this.autoAdd ) return;
        this.addPerson();
        this.maybeAdd();
      },
    },
  ],
  actions: [
    {
      name: 'addPerson',
      code: function() {
        var names = [
          'Mike',
          'Adam',
          'Kevin',
          'Justin',
          'Samantha',
        ];
        this.dao.put(this.Person.create({
          name: names[Math.floor(Math.random()*names.length)],
          age: Math.floor(Math.random()*10),
          sex: Math.floor(Math.random()*2) ? 'M' : 'F',
        }));
      },
    },
  ],
});

