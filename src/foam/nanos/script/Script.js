/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.script',
  name: 'Script',

  implements: [ 'foam.nanos.auth.EnabledAware' ],

  requires: [
    'foam.nanos.script.ScriptStatus',
    'foam.nanos.notification.Notification'
  ],

  imports: [ 'notificationDAO', 'user', 'scriptDAO' ],

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
    'static foam.mlang.MLang.*',
  ],

  tableColumns: [
    'id', 'enabled', 'server', 'description', 'lastDuration', 'status', 'run'
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
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'lastDuration',
      visibility: 'RO'
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
      class: 'foam.core.Enum',
      of: 'foam.nanos.script.ScriptStatus',
      name: 'status',
      visibility: 'RO',
      value: 'UNSCHEDULED',
      javaValue: 'ScriptStatus.UNSCHEDULED'
    },
    {
      class: 'String',
      name: 'code',
      view: { class: 'foam.u2.tag.TextArea', rows: 20, cols: 80, css: {"font-family": "monospace"} }
    },
    {
      class: 'String',
      name: 'output',
      visibility: 'RO',
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
          shell.eval("sudo(String user) { foam.util.Auth.sudo(x, user); }");
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
    },
    {
      name: 'poll',
      code: function() {
        var self = this;
        var interval = setInterval(function() {
            self.scriptDAO.find(self.id).then(function(script) {
              if ( script.status !== self.ScriptStatus.RUNNING ) {
                self.copyFrom(script);
                clearInterval(interval);

                // create notification
                var notification = self.Notification.create({
                  userId: self.user.id,
                  notificationType: "Script Execution",
                  body: `Status: ${script.status}
                        Script Output: ${script.output}
                        LastDuration: ${script.lastDuration}`
                });
                self.notificationDAO.put(notification);
              }
            }).catch(function() {
               clearInterval(interval);
              });
        }, 2000);
      }
    }
  ],

  actions: [
    {
      name: 'run',
      code: function() {
        var self = this;
        this.output = '';
        this.status = this.ScriptStatus.SCHEDULED;
        if ( this.server ) {
          this.scriptDAO.put(this).then(function(script) {
              self.copyFrom(script);
              if ( script.status === self.ScriptStatus.RUNNING ) {
                self.poll();
              }
          });
        } else {
          var log = function() { this.output = this.output + Array.prototype.join.call(arguments, '') + '\n'; }.bind(this);

          with ( { log: log, print: log, x: self.__context__ } ) {
            this.status = this.ScriptStatus.RUNNING;
            var ret = eval(this.code);
            var self = this;
            Promise.resolve(ret).then(function() {
              self.status = self.ScriptStatus.UNSCHEDULED;
              self.scriptDAO.put(self);
            });
          }
        }
      }
    }
  ]
});
