/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PermissionTemplateReference',

  documentation: `
    Used to construct permission templates for services using the ExtendedConfigurableAuthorizer.
    Services using the ExtendedConfigurableAuthorizer will be able to adjust authorization permissions on runtime using these class objects.
    The authorizer constructs a permission using these 'Permission Template' objects to contruct permissions and check against objects in other DAOs
    attempting to be authorized for all operations.

    Example:
      A PermissionTemplateReference with a daokey of ['userDAO'], operation "read" and PermissionTemplateProperties [{ class: 'PermissionTemplateProperty', propertyReference: 'language'}] would check the value of language
      against an object attempting to be authorized.

      In this case the userDAO would permit the user access to all users that match its property values to the permissions available to the requestor.
      The requestor may have the following permission 'userdao.read.en' granting access to all users with the values of language 'en'.

      In the case where conflicts may arise from properties holding similar values, a common one for example may be color
      You can set impliesValue on the PermissionTemplateProperty referenced in the list of your PermissionTemplateReference.

      Please see PermissionTemplateProperty.js for further documentation.

      ** TODO: Ranges are not supported.
  `,

  javaImports: ['java.util.ArrayList'],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'StringArray',
      name: 'daoKeys',
      documentation: `References dao keys used by services using the ConfigurableAuthorizer as their authorizer.`,
    },
    {
      class: 'Enum',
      name: 'operation',
      of: 'foam.nanos.dao.Operation',
      documentation: `Reference operation type of permission. Includes read, update and remove.`
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.auth.PermissionTemplateProperty',
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
          for (PermissionTemplateProperty templateProperty : getProperties()) {
            String propertyName = templateProperty.getPropertyReference();
              permission += templateProperty.getImpliesValue() ?
                  "." + propertyName + "[propertyValue]" :
                  ".propertyValueOf" + propertName;
          }
          arr.add(permission);
        }
        return arr;
      `
    }
  ]
});
