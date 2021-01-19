/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTemplateReference',

  documentation: `Used to construct permission templates for services using the ExtendedConfigurableAuthorizer.
    Also facilitates the use of the authorizer using references to values defined on the authorizer.
    Services using the ExtendedConfigurableAuthorizer will be able to adjust authorization permissions on runtime.
    The authorizer constructs a permission using this class object to check against the object attempting to be authorized.
    properties defined on this class object allows for grouped permissioning. 

    Example:
      A PermissionTemplateReference with a daokey of ['userDAO'], operation 'read' and properties ['language', 'firstName'] would check those properties 
      against an object attempting to be authorized.
      In this case the userDAO would permit the user to the mentioned permission access to all users that reference the properties defined on the template.
      The requestor may have the following permission 'userDAO.read.en.john' granting access to users with the values defined in the permissions brackets.

      ** Ranges are not currently supported, conflicts arise if property values conflict. Can be resolved by extended both the granted permission and template reference
      to account for the property and value.
  `,

  imports: [
    'nSpecDAO'
  ],

  javaImports: ['java.util.ArrayList'],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'StringArray',
      name: 'daoKeys',
      documentation: `References dao keys used by services using the ConfigurableAuthorizer as their authorizer.`
    },
    {
      class: 'Enum',
      name: 'operation',
      of: 'foam.nanos.ruler.Operations',
      documentation: `Reference operation type of permission. Includes read, update and remove.`
    },
    {
      class: 'StringArray',
      name: 'properties',
      documentation: `Furthur defines object properties to construct authorization permissions.
          If an object satisfies all property conditions it is authorized for the corresponding operation.
          Permission property segments are constructed in order of the values index.`,
    }
  ],

  methods: [
    {
      name: 'getPermissions',
      type: 'ArrayList<String>',
      code: `
        ArrayList<String> arr = new ArrayList();
        for ( String daoKey : getDaoKeys() ) {
          arr.add(daoKey, ".",getOperation(), String.join(".", getProperties()));
        }
        return arr;
      `
    }
  ]
});
