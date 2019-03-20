foam.CLASS({
  package: 'foam.test',
  name: 'CSVSinkDemo',
  requires: [
    'foam.dao.CSVSink',
    'foam.dao.EasyDAO'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          of: this.TestModel,
          seqNo: true
        });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.dao.CSVSink',
      name: 'sink',
      factory: function() {
        return this.CSVSink.create();
      }
    }
  ],
  classes: [
    {
      name: 'TestModel',
      properties: [
        {
          class: 'Int',
          name: 'id'
        },
        {
          class: 'String',
          name: 'str'
        },
        {
          class: 'Boolean',
          name: 'bool'
        }
      ]
    }
  ],
  actions: [
    {
      name: 'toCsv',
      code: function() {
        this.sink.reset();
        this.dao.select(this.sink);
      }
    },
    {
      name: 'fillDAO',
      code: function() {
        for ( var i = 0 ; i < 100 ; i++ ) {
          this.dao.put(this.TestModel.create({
            str: 'Random data ' + i,
            bool: Math.random() < 0.5
          }));
        }
      }
    }
  ]
});