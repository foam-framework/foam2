/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Group',

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  documentation: 'A Group of Users.',

  properties: [
    {
      class: 'String',
      name: 'id',
      documenation: 'Unique name of the Group.'
    },
    {
      class: 'String',
      name: 'description',
      documenation: 'Description of the Group.'
    },
    {
      class: 'String',
      name: 'parent',
      documentation: 'Parent group to inherit permissions from.'
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.auth.Permission',
      name: 'permissions'
    }

    /*
      FUTURE
    {
      class: 'FObjectProperty',
      of: 'AuthConfig',
      documentation: 'Custom authentication settings for this group.'
    }
    */
  ],
  methods: [
    {
      name: 'implies',
      javaReturns: 'Boolean',
      args: [
        {
          name: 'name',
          javaType: 'String'
        }
      ],
      javaCode:
        'if (getPermissions() == null) {return false;} \n' +
        'for (int i = 0; i < permissions_.length; i++) { \n' +
        '  if (permissions_[i].getId().equals(name)) { \n' +
        '    return true; \n' +
        '  } \n' +
        '} \n' +
        'return false;'
    }
  ]
});
