foam.CLASS({
  name: 'Test',
  requires: [
    'TestPropView',
    'foam.dao.EasyDAO',
  ],
  properties: [
    {
      class: 'Int',
      name: 'someValue',
      view: {
        class: 'TestPropView',
      },
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      factory: function() {
        var data = [];
        for ( var i = 0; i < 1000; i++ ) {
          data.push(this.DAOClass.create({id: i}));
        }
        return this.EasyDAO.create({
          of: this.DAOClass,
          daoType: 'MDAO',
          testData: data,
        });
      },
    },
  ],
  classes: [
    {
      name: 'DAOClass',
      properties: [
        'id',
        {
          class: 'String',
          name: 'name',
          expression: function(id) {
            return 'Person ' + id;
          },
        },
      ],
    },
  ],
});
