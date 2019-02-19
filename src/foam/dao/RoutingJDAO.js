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
    'foam.dao.JDAO'
  ],
  documentation: `JDAO that adds the service name to the context to use for
    routing to correct DAO. Doing this allows the underlying journal
    implementation to output the DAO name alongside the journal entry which will
    aid in using a single journal file.`,

  properties: [
    {
      class: 'String',
      name: 'service',
      documentation: 'Name of the service.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.dao.DAO',
      name: 'delegate',
      documentation: `Underlying innerDAO (e.g., MapDAO or MDAO) where the
        entries can be directly put into on replay.`
    },
    {
      class: 'FObjectProperty',
      of: 'foam.dao.RoutingJournal',
      name: 'journal',
      documentation: 'Shared journal where new entries are being put into.',
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
      documentation: `Check if the replayingJournal is set in context. If it is,
        then this is a find called from within a journal replay; bypass all of
        the decorators. Otherwise, find on the decorator.`,
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
      documentation: `Check if the replayingJournal is set in context. If it is,
        then this is a put called from within a journal replay; bypass all of
        the decorators. Otherwise, put on the decorator.`,
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
      documentation: `Check if the replayingJournal is set in context. If it is,
        then this is a remove called from within a journal replay; bypass all of
        the decorators. Otherwise, remove on the decorator.`,
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
