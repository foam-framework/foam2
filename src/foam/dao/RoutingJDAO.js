/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RoutingJDAO',
  extends: 'foam.dao.PromisedDAO',
  requires: [
    'foam.dao.java.JDAO'
  ],
  documentation:
    `JDAO that adds the service name to the context to use for routing to correct DAO.
    Doing this allows the underlying journal implementation to output the DAO name
    alongside the journal entry which will aid in using a single journal file.`,

  properties: [
    {
      class: 'String',
      name: 'service',
      documentation: 'Name of the service'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.dao.DAO',
      name: 'delegate'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.dao.RoutingJournal',
      name: 'journal',
      javaPostSet: `
new Thread() {
  public void run() {
    getJournal().waitForReplay();
    setPromise(
      new foam.dao.java.JDAO.Builder(getX())
        .setOf(getOf())
        .setDelegate(getDelegate())
        .setJournal(getJournal())
        .build()
    );
  }
}.start();
      `
    }
  ],

  methods: [
    {
      name: 'find_',
      flags: null,
      javaCode: `
if ( x.get("replayingJournal") == getJournal() ) {
  return getDelegate().find_(x, id);
} else {
  return super.find_(x, id);
}
      `
    },
    {
      name: 'put_',
      flags: null,
      javaCode: `
if ( x.get("replayingJournal") == getJournal() ) {
  return getDelegate().put_(x, obj);
} else {
  return super.put_(x.put("service", getService()), obj);
}
      `
    },
    {
      name: 'remove_',
      flags: null,
      javaCode: `
if ( x.get("replayingJournal") == getJournal() ) {
  return getDelegate().remove_(x, obj);
} else {
  return super.remove_(x.put("service", getService()), obj);
}
      `
    }
  ]
});
