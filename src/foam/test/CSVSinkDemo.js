/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.test',
  name: 'CSVSinkDemo',

  requires: [
    'foam.dao.CSVSink',
    'foam.dao.EasyDAO',
    'foam.nanos.auth.Phone'
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
        return this.CSVSink.create({ of: this.TestModel });
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
        },
        {
          class: 'Array',
          name: 'arr'
        },
        {
          class: 'FObjectProperty',
          name: 'fop',
          of: 'foam.nanos.auth.Phone'
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
            bool: Math.random() < 0.5,
            arr: [Math.random()],
            fop: this.Phone.create({ number: '111-111-1111' })
          }));
        }
      }
    }
  ]
});
