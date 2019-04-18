/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'LinkPropertiesDAO',
  extends: 'foam.dao.ProxyDAO',
  flags: ['java'],

  documentation: `
    When you have two models with a relationship between them and you want a
    property on one of the models to reflect the value of a property on the
    other model, you can use this decorator to make that happen.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'java.util.List',
    'static foam.mlang.MLang.EQ',
  ],

  properties: [
    {
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      name: 'sourceProperty',
      documentation: `This property will be watched for changes.`
    },
    {
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      name: 'targetProperty',
      documentation: `This property will follow the value of 'sourceProperty'.`
    },
    {
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      name: 'relationshipProperty',
      documentation: 'The property on the target model that references the source model.'
    },
    {
      class: 'String',
      name: 'targetDAOKey',
      documentation: 'The DAO that the target objects are stored in.'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        DAO targetDAO = ((DAO) x.get(getTargetDAOKey())).inX(x);
        PropertyInfo idProperty = (PropertyInfo) getOf().getAxiomByName("id");
        List<FObject> targetObjects = ((ArraySink) targetDAO
          .where(EQ(getRelationshipProperty(), idProperty.get(obj)))
          .select(new ArraySink())).getArray();

        for ( FObject targetObj : targetObjects ) {
          targetObj = targetObj.fclone();
          getTargetProperty().set(targetObj, getSourceProperty().get(obj));
          targetDAO.put(targetObj);
        }

        return super.put_(x, obj);
      `
    }
  ]
});
