/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.script',
  name: 'Language',

  documentation: 'Scripting language',

  values: [
    { name: 'JS',        label: 'Javascript' },
    { name: 'BEANSHELL', label: 'BeanShell'  }
  ]
});


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
      class: 'Enum',
      of: 'foam.nanos.script.Language',
      name: 'language',
      value: foam.nanos.script.Language.BEANSHELL
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
