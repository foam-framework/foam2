/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'io.c9.ace',
  name: 'Config',
  imports: [
    'controllerMode?'
  ],
  properties: [
    {
      class: 'Int',
      name: 'height',
      value: 800
    },
    {
      class: 'Int',
      name: 'width',
      value: 800
    },
    {
      class: 'Enum',
      of: 'io.c9.ace.Theme',
      name: 'theme'
    },
    {
      class: 'Enum',
      of: 'io.c9.ace.Mode',
      name: 'mode',
      value: 'JAVA'
    },
    {
      class: 'Enum',
      of: 'io.c9.ace.KeyBinding',
      name: 'keyBinding',
      value: 'ACE'
    },
    {
      class: 'Boolean',
      name: 'isReadOnly',
      expression: function(controllerMode) {
        return controllerMode === foam.u2.ControllerMode.VIEW;
      }
    }
  ]
});
