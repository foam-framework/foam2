foam.CLASS({
  package: 'com.google.foam.demos.daolist',
  name: 'View',
  extends: 'foam.u2.View',
  requires: [
    'com.google.foam.demos.daolist.Person',
    'foam.dao.EasyDAO',
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.True',
    'foam.parse.QueryParser',
    'foam.u2.view.TextField',
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      hidden: true,
      name: 'dao',
      factory: function() {
        return this.EasyDAO.create({
          of: this.Person,
          daoType: 'MDAO',
          guid: true,
          testData: [
            {
              firstName: 'Mike',
              lastName: 'C',
              age: 30,
            },
            {
              firstName: 'Bob',
              lastName: 'Loblaw',
              age: 40,
            },
            {
              firstName: 'Joe',
              lastName: 'Shmoe',
              age: 20,
            },
          ],
        });
      },
    },

    {
      name: 'textFieldView',
    },

    {
      name: 'queryParser',
      expression: function(dao$of) {
        return this.QueryParser.create({ of: dao$of });
      }
    },
    {
      name: 'predicate',
      expression: function(queryParser, textFieldView$data) {
        var str = textFieldView$data;
        return str ?
          queryParser.parseString(str) || this.False.create() :
          this.True.create();
      },
    },

    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      expression: function(dao, predicate) {
        return dao.where(predicate)
      },
    },
  ],
  methods: [
    function initE() {
      this.SUPER();
      this.
        start(this.TextField, { onKey: true }, this.textFieldView$).end().
        select(this.filteredDAO$proxy, function(p) {
          return this.E().
            add(p.fullName, ' - ', p.age);
        });
    },
  ],
});
