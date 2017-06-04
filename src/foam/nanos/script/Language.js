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
