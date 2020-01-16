/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'ScriptPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  javaImports: [
    'bsh.EvalError',
    'bsh.Interpreter',
    'foam.core.*',
    'foam.dao.*',
    'foam.nanos.logger.Logger',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.*',
    'static foam.mlang.MLang.*',
  ],

  properties: [
    {
      class: 'String',
      name: 'code',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 20, cols: 120,
        css: { 'font-family': 'monospace' }
      }
    }
  ],

  methods: [
    {
      name: 'f',
      args: [
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      type: 'Boolean',
      javaCode: `
      Interpreter shell = createInterpreter(getX());

      try {
        return (boolean) shell.eval(getCode());
      } catch (Throwable e) {
        Logger logger = (Logger) getX().get("logger");
        logger.error(e);
      }
      return false;
      `
    },
    {
      name: 'createInterpreter',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaType: 'Interpreter',
      javaCode: `
        Interpreter shell = new Interpreter();

        try {
          shell.set("x", x);
        } catch (EvalError e) {}

        return shell;
      `
    }
  ]
});
