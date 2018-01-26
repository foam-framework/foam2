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
    'foam.core.*',
    'foam.dao.*',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.*',
    'foam.nanos.pm.PM',
    'foam.nanos.session.Session',
    'java.io.ByteArrayOutputStream',
    'java.io.PrintStream',
    'java.util.Date',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  tableColumns: [
    'id', 'enabled', 'server', /*'language',*/ 'description', 'lastDuration', 'run'
  ],

  searchColumns: [],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'enabled'
    },
    {
      class: 'String',
      name: 'description',
      displayWidth: 80
    },
    {
      class: 'DateTime',
      name: 'lastRun',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Long',
      name: 'lastDuration',
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
      view: { class: 'foam.u2.tag.TextArea', rows: 20, cols: 80, css: {"font-family": "monospace"} }
    },
    {
      class: 'String',
      name: 'output',
      visibility: foam.u2.Visibility.RO,
      view: { class: 'foam.u2.tag.TextArea', rows: 12, cols: 80, css: {"font-family": "monospace"}  }
    },
    {
      class: 'String',
      name: 'notes',
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 80 }
    }
  ],

  methods: [
    {
      name: 'sudo',
      args: [
        { name: 'userName', javaType: 'String' }
      ],
      javaReturns: 'X',
      javaCode: `
        X x = getX();
        User user = (User) ((DAO) x.get("userDAO")).inX(x).find(EQ(User.EMAIL, userName));

        if ( user == null ) throw new RuntimeException("Unknown user");

        Session session = new Session();
        x = x.put(Session.class, session);
        x = x.put("user", user);
        session.setUserId(user.getId());
        session.setContext(x);

        return x;
      `
    },
    {
      name: 'createInterpreter',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'Interpreter',
      javaCode: `
        Interpreter shell = new Interpreter();

        try {
          shell.set("currentScript", this);
          shell.set("x", x);
          shell.eval("runScript(String name) { script = x.get(\\"scriptDAO\\").find(name); if ( script != null ) eval(script.code); }");
          shell.eval("sudo(String user) { currentScript.sudo(user); }");
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
        } catch (Throwable e) {
          ps.println();
          e.printStackTrace(ps);
          e.printStackTrace();
        } finally {
          pm.log(x);
        }

        setLastRun(new Date());
        setLastDuration(pm.getTime());
        ps.flush();
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
