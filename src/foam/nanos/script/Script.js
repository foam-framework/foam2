/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
supressWarnings([
  `Unknown property foam.core.Model.tableColumns: id,enabled,server,description,run`,
  `Unknown property foam.core.DateTime.visibility: RO`,
  `Unknown property foam.core.String.visibility: RO`
])
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
      name: 'createInterpreter',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'Interpreter',
      javaCode: `
        Interpreter shell = new Interpreter();

        try {
          shell.set("currentScript", this);
          shell.set("x", getX());
          shell.eval("runScript(String name) { script = x.get(\\"scriptDAO\\").find(name); if ( script != null ) eval(script.code); }");
        } catch (EvalError e) {}

        return shell;
      `
    },
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
        Interpreter           shell = createInterpreter(x);
        PM                    pm    = new PM(this.getClass(), getId());

        // TODO: import common packages like foam.core.*, foam.dao.*, etc.
        try {
          setOutput("");
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
        var self = this;
        this.output = '';

//        if ( this.language === foam.nanos.script.Language.BEANSHELL ) {
        if ( this.server ) {
          this.scheduled = true;
          this.scriptDAO.put(this).then(function(script) {
            self.copyFrom(script);
          });
        } else {
          var log = function() { this.output = this.output + Array.prototype.join.call(arguments, ''); }.bind(this);

          with ( { log: log, print: log, x: self.__context__ } ) {
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
