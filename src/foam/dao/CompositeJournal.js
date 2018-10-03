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
      name: 'put_',
      javaCode: `
        for ( Journal delegate : getDelegates() ) {
          delegate.put_(x, old, nu);
        }
      `
    },
    {
      name: 'remove',
      javaCode: `
        for ( Journal delegate : getDelegates() ) {
          delegate.remove(x, obj);
        }
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
