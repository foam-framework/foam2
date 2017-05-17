/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.script',
  name: 'Script',

  implements: [ 'foam.nanos.auth.EnabledAware' ],
  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'DateTime',
      name: 'lastRun'
    },
    {
      class: 'String',
      name: 'notes',
      view: { class: 'foam.u2.tag.TextArea', rows: 10, cols: 80 }
    },
    {
      class: 'String',
      name: 'code',
      view: { class: 'foam.u2.tag.TextArea', rows: 20, cols: 80 }
    },
    {
      class: 'String',
      name: 'output',
      visibility: foam.u2.Visibility.RO,
      view: { class: 'foam.u2.tag.TextArea', rows: 20, cols: 80 }
    }
  ]
});
