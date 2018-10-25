foam.CLASS({
  package: 'foam.u2.mlang',
  name: 'Demo',
  extends: 'foam.u2.Element',
  requires: [
    'foam.dao.EasyDAO',
    'foam.u2.mlang.Table',
    'foam.u2.mlang.Pie',
    'foam.mlang.sink.Count',
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

      var tableSink = this.Table.create({
        columns: ['name', 'age', 'sex'],
      });
      this.dao.pipe(tableSink)

      var pieSink = this.Pie.create({
        arg1: this.Person.SEX,
        arg2: this.Count.create(),
      });
      this.dao.pipe(pieSink)

      this.
        startContext({ data: this }).
          add(this.ADD_PERSON).
          add(this.REMOVE_PERSON).
        endContext().
        add(pieSink).
        add(tableSink);
    },
  ],
  actions: [
    {
      name: 'addPerson',
      code: function() {
        var names = [
          'Joe',
          'Bob',
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
    {
      name: 'removePerson',
      code: function() {
        var self = this;
        self.dao.select().then(function(sink) {
          var a = sink.array;
          if ( ! a.length ) return;
          var o = a[Math.floor(Math.random()*a.length)]
          self.dao.remove(o);
        });
      },
    },
  ],
});
