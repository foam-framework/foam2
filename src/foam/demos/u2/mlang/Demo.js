/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.u2.mlang',
  name: 'Demo',
  extends: 'foam.u2.Element',
  requires: [
    'foam.dao.EasyDAO',
    'foam.u2.mlang.Table',
    'foam.u2.mlang.Pie',
    'foam.u2.mlang.Sequence',
    'foam.mlang.sink.Count',
  ],
  implements: [
    'foam.mlang.Expressions',
  ],
  properties: [
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
  methods: [
    function initE() {
      this.SUPER();

      var GROUP_BY = this.GROUP_BY.bind(this);
      var COUNT = this.COUNT.bind(this);
      var Person = this.Person;

      var PIE = function(arg1) {
        return this.Pie.create({
          arg1: arg1,
          arg2: this.Count.create(),
        })
      }.bind(this);

      var SEQ = function() {
        return this.Sequence.create({
          data: Array.from(arguments),
        })
      }.bind(this);

      var TABLE = function() {
        return this.Table.create({
          columns: Array.from(arguments)
        });
      }.bind(this);

      var sink = GROUP_BY(Person.NAME, SEQ(COUNT(), PIE(Person.SEX)));
      this.dao.pipe(sink);

      var tableSink = TABLE('name', 'age', 'sex')
      this.dao.pipe(tableSink)

      this.
        startContext({ data: this }).
          add(this.ADD_PERSON).
        endContext().
        start('table').
          attr('border', 1).
          start('tr').
            start('td').
              start('pre').
                add(`TABLE('name', 'age', 'sex')`).
              end().
              add(tableSink).
            end().
            start('td').
              start('pre').
                add(`GROUP_BY(Person.NAME, SEQ(COUNT(), PIE(Person.SEX)))`).
              end().
              add(sink).
            end().
          end().
        end();
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
        ];
        this.dao.put(this.Person.create({
          name: names[Math.floor(Math.random()*names.length)],
          age: Math.floor(Math.random()*100),
          sex: Math.floor(Math.random()*2) ? 'M' : 'F',
        }));
      },
    },
  ],
});
