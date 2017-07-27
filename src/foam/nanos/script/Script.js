/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.script',
  name: 'Script',

  implements: [ 'foam.nanos.auth.EnabledAware' ],

  imports: [ 'scriptDAO' ],

  javaImports: [
    'bsh.EvalError',
    'bsh.Interpreter',
    'foam.nanos.pm.PM',
    'java.io.ByteArrayOutputStream',
    'java.io.PrintStream',
    'java.util.Date'
  ],

  tableColumns: [
    'id', 'enabled', 'server', /*'language',*/ 'description', 'run'
  ],

  searchColumns: [ ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'DateTime',
      name: 'lastRun',
      visibility: foam.u2.Visibility.RO
    },
    /*
    {
      class: 'Enum',
      of: 'foam.nanos.script.Language',
      name: 'language',
      value: foam.nanos.script.Language.BEANSHELL,
      transient: true
      // TODO: fix JS support
    },
    */
    {
      class: 'Boolean',
      name: 'server',
      value: true
    },
    {
      class: 'Boolean',
      name: 'scheduled',
      hidden: true
    },
    {
      class: 'String',
      name: 'code',
      view: { class: 'foam.u2.tag.TextArea', rows: 20, cols: 80 }
    },
    {
      class: 'String',
      name: 'output',
      visibility: foam.u2.Visibility.RO,
      view: { class: 'foam.u2.tag.TextArea', rows: 20, cols: 80 }
    },
    {
      class: 'String',
      name: 'notes',
      view: { class: 'foam.u2.tag.TextArea', rows: 10, cols: 80 }
    }
  ],

  methods: [
    {
      name: 'runScript',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'void',
      javaCode: `
        ByteArrayOutputStream baos  = new ByteArrayOutputStream();
        PrintStream           ps    = new PrintStream(baos);
        Interpreter           shell = new Interpreter();
        PM                    pm    = new PM(this.getClass(), getId());

        // TODO: import common packages like foam.core.*, foam.dao.*, etc.
        try {
          shell.set("currentScript", this);
          setOutput("");
          shell.set("x", getX());
          shell.setOut(ps);
          shell.eval(getCode());
        } catch (EvalError e) {
          e.printStackTrace();
        } finally {
          pm.log(x);
        }

        setLastRun(new Date());
        ps.flush();
      System.err.println("******************** Output: " + baos.toString());
        setOutput(baos.toString());
    `
    }
  ],

  actions: [
    {
      name: 'run',
      code: function() {
        this.output = '';

//        if ( this.language === foam.nanos.script.Language.BEANSHELL ) {
        if ( this.server ) {
          this.scheduled = true;
          this.scriptDAO.put(this);
        } else {
          var log = function() { this.output = this.output + Array.prototype.join.call(arguments, ''); }.bind(this);

          with ( { log: log } ) {
            var ret = eval(this.code);
            console.log('ret: ', ret);
            // TODO: if Promise returned, then wait
          }

          this.scriptDAO.put(this);
        }
      }
    }
  ]
});
