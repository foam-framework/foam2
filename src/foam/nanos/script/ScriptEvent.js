/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.script',
  name: 'ScriptEvent',

  documenation: `Captures the running of a Script`,

  implements: [
    'foam.nanos.auth.LastModifiedByAware'
  ],

  tableColumns: [
    'type',
    'owner',
    'lastRun',
    'lastDuration'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      visibility: 'RO'
    },
    {
      docementation: `Set on event creation to the class name of the Script - Script, Cron, Test, for example.`,
      name: 'type',
      class: 'String',
      visibility: 'RO',
      tableWidth: 100,
    },
    {
      class: 'DateTime',
      name: 'lastRun',
      documentation: 'Date and time the script ran last.',
      visibility: 'RO',
      tableWidth: 140
    },
    {
      class: 'Duration',
      name: 'lastDuration',
      documentation: 'Date and time the script took to complete.',
      visibility: 'RO',
      tableWidth: 125
    },
    {
      class: 'String',
      name: 'output',
      visibility: 'RO',
      view: {
        class: 'foam.u2.view.ModeAltView',
        readView: { class: 'foam.u2.view.PreView' }
      }
    },
    {
      documentation: 'User who last modified script',
      name: 'lastModifiedBy',
      class: 'Reference',
      of: 'foam.nanos.auth.User'
    }
  ]
});
