foam.CLASS({
  package: 'foam.dao',
  name: 'OnDeleteRemoveChildrenDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.mlang.MLang'
  ],

  properties: [
    {
      class: 'Object',
      name: 'sourceKey',
      javaType: 'foam.core.PropertyInfo',
    },
    {
      class: 'Object',
      name: 'targetKey',
      javaType: 'foam.core.PropertyInfo',
    },
    {
      class: 'String',
      name: 'targetDAOKey',
    },
  ],
  methods: [
    {
      name: 'remove_',
      code: function(x, id) {
      },
      javaCode: `
      DAO targetDAO = ((DAO) x.get(getTargetDAOKey())).where(MLang.EQ(getTargetKey(), getSourceKey().get(obj)));
      try {
        targetDAO.removeAll();
      }
      catch (Exception e) {
        throw new RuntimeException("Unable to delete children");
      }
      return getDelegate().remove_(x, obj);
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
      public OnDeleteRemoveChildrenDAO(foam.core.X x, foam.dao.DAO delegate, foam.core.PropertyInfo sourceKey, foam.core.PropertyInfo targetKey, String targetDAOKey) {
      setSourceKey(sourceKey);
      setTargetKey(targetKey);
      setTargetDAOKey(targetDAOKey);
      setDelegate(delegate);
}
        `);
      },
    },
  ]
});
