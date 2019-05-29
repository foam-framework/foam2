foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'AddMissingPermissionsRule',
  flags: ['java'],

  documentation: `
    When a groupPermissionJunction is created for a permission that doesn't
    exist in permissionDAO yet, this rule will put the new permission to
    permissionDAO.
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.GroupPermissionJunction',
    'foam.nanos.auth.Permission'
  ],

  messages: [
    {
      name: 'DESCRIBE_TEXT',
      message: 'Creates a permission and puts it to permissionDAO whenever a groupPermissionJunction is created for a permission that does not exist in permissionDAO yet.',
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        DAO permissionDAO = (DAO) x.get("permissionDAO");
        GroupPermissionJunction j = (GroupPermissionJunction) obj;
        
        if ( permissionDAO.find(j.getTargetId()) == null ) {
          Permission p = new Permission.Builder(x)
            .setId(j.getTargetId())
            .build();
          permissionDAO.put(p);
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: '// NOOP'
    },
    {
      name: 'canExecute',
      javaCode: 'return true;'
    },
    {
      name: 'describe',
      javaCode: 'return DESCRIBE_TEXT;'
    }
  ]
});
