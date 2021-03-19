/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.core',
  name: 'ValidationException',
  extends: 'foam.core.ClientRuntimeException',
  javaGenerateConvenienceConstructor: false,

  properties: [
    {
      class: 'Object',
      of: 'foam.core.PropertyInfo',
      name: 'propertyInfo'
    },
    {
      class: 'String',
      name: 'propName'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
    public ValidationException(String message) {
      super(message);
    }

    public ValidationException(String message, java.lang.Exception cause) {
      super(message, cause);
    }
            `
        }));
      }
    }
  ]
});
