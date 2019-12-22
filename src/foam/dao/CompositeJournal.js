/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'CompositeJournal',
  extends: 'foam.dao.AbstractJournal',
  flags: ['java'],

  documentation: 'Composite journal implementation',

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.dao.Journal',
      name: 'delegates'
    }
  ],

  methods: [
    {
      name: 'put',
      type: 'FObject',
      args: [
        { name: 'x',      type: 'Context' },
        { name: 'prefix', type: 'String' },
        { name: 'dao',    type: 'DAO' },
        { name: 'obj',    type: 'foam.core.FObject' }
      ],
      javaCode: `
        // TODO: only pass real 'dao' on one delegate call
        for ( Journal delegate : getDelegates() ) {
          delegate.put(x, prefix, dao, obj);
        }
        return obj;
      `
    },
    {
      name: 'remove',
      type: 'FObject',
      args: [
        { name: 'x',      type: 'Context' },
        { name: 'prefix', type: 'String' },
        { name: 'dao',    type: 'DAO' },
        { name: 'obj',    type: 'foam.core.FObject' }
      ],
      javaCode: `
        for ( Journal delegate : getDelegates() ) {
          delegate.remove(x, prefix, dao, obj);
        }
        return obj;
      `
    },
    {
      name: 'replay',
      javaCode: `
        for ( Journal delegate : getDelegates() ) {
          delegate.replay(x, dao);
        }
      `
    }
  ]
});
