/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'ValidatingDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.*'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'Validator',
      name: 'validator'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            public ValidatingDAO(X x, DAO delegate) {
              this(x, delegate, ValidatableValidator.instance());
            }

            public ValidatingDAO(X x, DAO delegate, Validator validator) {
              setX(x);
              setDelegate(delegate);
              setValidator(validator);
            }
          `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaThrows: [
        'IllegalStateException'
      ],
      javaCode: `
        getValidator().validate(x, obj);
        return super.put_(x, obj);
      `
    }
  ]
});
