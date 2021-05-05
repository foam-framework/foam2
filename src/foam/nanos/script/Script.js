/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.script',
  name: 'Script',

  implements: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.medusa.Clusterable'
  ],

  requires: [
    'foam.nanos.script.Language',
    'foam.nanos.script.ScriptStatus',
    'foam.nanos.notification.Notification',
    'foam.nanos.notification.ScriptRunNotification',
    'foam.nanos.notification.ToastState'
  ],

  imports: [
    'notificationDAO',
    'scriptDAO',
    'scriptEventDAO',
    'user'
  ],

  javaImports: [
    'foam.core.*',
    'foam.dao.*',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.*',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',

    'java.io.BufferedReader',
    'java.io.ByteArrayOutputStream',
    'java.io.PrintStream',
    'java.io.StringReader',
    'java.util.ArrayList',
    'java.util.Date',
    'java.util.List',
    'java.util.Map',

    'bsh.EvalError',
    'bsh.Interpreter',
    'jdk.jshell.JShell'
  ],

  tableColumns: [
    'id',
    'description',
    'lastDuration',
    'lastRun',
    'status'
  ],

  searchColumns: [
    'id',
    'description'
  ],

  constants: [
    {
      name: 'MAX_OUTPUT_CHARS',
      type: 'Integer',
      value: 20000
    },
    {
      name: 'MAX_NOTIFICATION_OUTPUT_CHARS',
      type: 'Integer',
      value: 200
    },
    {
      javaType: 'X[]',
      name: 'X_HOLDER',
      javaValue: 'new X[1]'
    }
  ],

  sections: [
    {
      name: 'scriptEvents',
      title: 'Events',
      order: 2
    },
    {
      name: '_defaultSection',
      title: 'Info',
      order: 1
    }
  ],

  messages: [
    { name: 'EXECUTION_DISABLED', message: 'execution disabled' },
    { name: 'EXECUTION_INVOKED', message: 'execution invoked' },
    { name: 'EXECUTION_FAILED', message: 'execution failed' },
    { name: 'ENABLED_YES', message: 'Y' },
    { name: 'ENABLED_NO', message: 'N' },
    { name: 'PRIORITY_LOW', message: 'Low' },
    { name: 'PRIORITY_MEDIUM', message: 'Medium' },
    { name: 'PRIORITY_HIGH', message: 'High' }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      includeInDigest: true,
      tableWidth: 300
    },
    {
      class: 'Boolean',
      name: 'enabled',
      includeInDigest: true,
      documentation: 'Enables script.',
      tableCellFormatter: function(value, obj) {
        this.start()
          .style({ color: value ? /*%APPROVAL3*/ 'green' : /*%GREY2%*/ 'grey' })
          .add(value ? obj.ENABLED_YES : obj && obj.ENABLED_NO || 'N')
        .end();
      },
      tableWidth: 90,
      value: true
    },
    {
      class: 'String',
      name: 'description',
      includeInDigest: false,
      documentation: 'Description of the script.',
      tableWidth: 300
    },
    {
      class: 'Int',
      name: 'priority',
      value: 5,
      javaValue: 5,
      includeInDigest: false,
      view: function(_, X ) {
        return {
          class: 'foam.u2.view.ChoiceView',
          choices: [
            [4, X.data.PRIORITY_LOW],
            [5, X.data.PRIORITY_MEDIUM],
            [6, X.data.PRIORITY_HIGH]
          ]
        };
      }
    },
    {
      documentation: 'A non-clusterable script can run on all instances, and any run info will be stored locally',
      name: 'clusterable',
      class: 'Boolean',
      value: true,
      includeInDigest: false,
    },
    {
      documentation: 'Generate notification on script completion',
      name: 'notify',
      class: 'Boolean',
      value: false
    },
    {
      class: 'DateTime',
      name: 'lastRun',
      documentation: 'Date and time the script ran last.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableWidth: 140,
      storageTransient: true,
      storageOptional: true
    },
    {
      class: 'Duration',
      name: 'lastDuration',
      documentation: 'Date and time the script took to complete.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableWidth: 125,
      storageTransient: true,
      storageOptional: true
    },
    {
      class: 'Enum',
      of: 'foam.nanos.script.Language',
      name: 'language',
      value: 'BEANSHELL'
    },
    {
      documentation: 'Legacy support for JS scripts created before JShell',
      class: 'Boolean',
      name: 'server',
      value: true,
      transient: true,
      visibility: 'HIDDEN',
      javaSetter: `
        if ( val ) {
          setLanguage(foam.nanos.script.Language.BEANSHELL);
        } else {
          setLanguage(foam.nanos.script.Language.JS);
        }
      `,
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.script.ScriptStatus',
      name: 'status',
      documentation: 'Status of script.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      value: 'UNSCHEDULED',
      javaValue: 'ScriptStatus.UNSCHEDULED',
      tableWidth: 120,
      storageTransient: true,
      storageOptional: true
    },
    {
      class: 'Code',
      name: 'code',
      includeInDigest: true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'output',
      includeInDigest: false,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      view: {
        class: 'foam.u2.view.ModeAltView',
        readView: { class: 'foam.u2.view.PreView' }
      },
      preSet: function(_, newVal) {
        // for client side scripts
        if ( newVal.length > this.MAX_OUTPUT_CHARS ) {
          newVal = newVal.substring(0, this.MAX_OUTPUT_CHARS) + '...';
        }
        return newVal;
      },
      javaSetter: `
      // for server side scripts
      if (val.length() > MAX_OUTPUT_CHARS) {
        val = val.substring(0, MAX_OUTPUT_CHARS) + "...";
      }
      output_ = val;
      outputIsSet_ = true;
      `,
      storageTransient: true
    },
    {
      class: 'String',
      name: 'notes',
      includeInDigest: false,
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 144 }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      includeInDigest: true,
      documentation: 'User who last modified script'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      includeInDigest: true,
      documentation: 'Agent acting user who last modified script'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      includeInDigest: false,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'String',
      name: 'daoKey',
      value: 'scriptDAO',
      transient: true,
      visibility: 'HIDDEN',
      documentation: 'Name of dao to store script itself. To set from inheritor just change property value'
    },
    {
      class: 'String',
      name: 'eventDaoKey',
      value: 'scriptEventDAO',
      transient: true,
      visibility: 'HIDDEN',
      documentation: 'Name of dao to store script run/event report. To set from inheritor just change property value',
      tableWidth: 120
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'createInterpreter',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'ps', type: 'PrintStream' }
      ],
      javaType: 'Object',
      synchronized: true,
      javaCode: `
        Language l = getLanguage();
        if ( l == foam.nanos.script.Language.JSHELL ) {
          JShell jShell = new JShellExecutor().createJShell(ps);
          Script.X_HOLDER[0] = x.put("out",  ps);
          jShell.eval("import foam.core.X;");
          jShell.eval("X x = foam.nanos.script.Script.X_HOLDER[0];");
          return jShell;
        } else if ( l == foam.nanos.script.Language.BEANSHELL ) {
          Interpreter shell = new Interpreter();
          try {
            shell.set("currentScript", this);
            shell.set("x", x);
            shell.eval("runScript(String name) { script = x.get("+getDaoKey()+").find(name); if ( script != null ) eval(script.code); }");
            shell.eval("foam.core.X sudo(String user) { foam.util.Auth.sudo(x, (String) user); }");
            shell.eval("foam.core.X sudo(Object id) { foam.util.Auth.sudo(x, id); }");
          } catch (EvalError e) {
            Logger logger = (Logger) x.get("logger");
            logger.error(this.getClass().getSimpleName(), "createInterpreter", getId(), e);
          }
          return shell;
        } else {
          throw new RuntimeException("Script language not supported");
        }
      `
    },
    {
      name: 'canRun',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Boolean',
      javaCode: `
        return true;
      `
    },
    {
      name: 'runScript',
      code: function() {
        var log = () => {
          this.output += Array.from(arguments).join('') + '\n';
        };
        try {
          with ({ log: log, print: log, x: this.__context__ })
          return Promise.resolve(eval(this.code));
        } catch (err) {
          this.output += err;
          return Promise.reject(err);
        }
      },
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
        canRun(x);
        PM               pm          = new PM.Builder(x).setKey(Script.getOwnClassInfo().getId()).setName(getId()).build();
        RuntimeException thrown      = null;
        Language         l           = getLanguage();
        Thread.currentThread().setPriority(getPriority());

        try {
            ByteArrayOutputStream baos  = new ByteArrayOutputStream();
            PrintStream           ps    = new PrintStream(baos);

            try {
              if ( l == foam.nanos.script.Language.BEANSHELL ) {
                Interpreter shell = (Interpreter) createInterpreter(x, null);
                setOutput("");
                shell.setOut(ps);
                shell.eval(getCode());
              } else if ( l == foam.nanos.script.Language.JSHELL ) {
                String print = null;
                JShell jShell = (JShell) createInterpreter(x,ps);
                print = new JShellExecutor().execute(x, jShell, getCode());
                ps.print(print);
              } else {
                throw new RuntimeException("Script language not supported");
              }
            } catch (Throwable t) {
              thrown = new RuntimeException(t);
              ps.println();
              t.printStackTrace(ps);
              Logger logger = (Logger) x.get("logger");
              logger.error(this.getClass().getSimpleName(), "runScript", getId(), t);
              pm.error(x, t);
            } finally {
              pm.log(x);
            }

          setLastRun(new Date());
          setLastDuration(pm.getTime());
          ps.flush();
          setOutput(baos.toString());

          ScriptEvent event = new ScriptEvent(x);
          event.setLastRun(this.getLastRun());
          event.setLastDuration(this.getLastDuration());
          event.setOutput(this.getOutput());
          event.setScriptType(this.getClass().getSimpleName());
          event.setOwner(this.getId());
          event.setScriptId(this.getId());
          event.setHostname(System.getProperty("hostname", "localhost"));
          event.setClusterable(this.getClusterable());
          ((DAO) x.get(getEventDaoKey())).put(event);

          if ( thrown != null) {
            throw thrown;
          }
        } finally {
          Thread.currentThread().setPriority(Thread.NORM_PRIORITY);
        }
    `
    },
    {
      name: 'poll',
      code: function() {
        var self = this;
        var interval = setInterval(function() {
          self.__context__[self.daoKey].find(self.id).then(function(script) {
            if ( script.status === self.ScriptStatus.UNSCHEDULED
              || script.status === self.ScriptStatus.ERROR
            ) {
              self.copyFrom(script);
              clearInterval(interval);

              if ( self.notify ) {
                // create notification
                var notification = self.ScriptRunNotification.create({
                  userId: self.user.id,
                  scriptId: script.id,
                  notificationType: 'Script Execution',
                  body: `Status: ${script.status}
                    Script Output: ${script.length > self.MAX_NOTIFICATION_OUTPUT_CHARS ?
                      script.output.substring(0, self.MAX_NOTIFICATION_OUTPUT_CHARS) + '...' :
                      script.output }
                    LastDuration: ${script.lastDuration}`
                });
                self.notificationDAO.put(notification);
              }
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
      tableWidth: 90,
      confirmationRequired: function() {
        return true;
      },
      code: function() {
        var self = this;
        this.output = '';
        this.status = this.ScriptStatus.SCHEDULED;
        if ( this.language == this.Language.BEANSHELL ||
             this.language == this.Language.JSHELL ) {
          this.__context__[this.daoKey].put(this).then(function(script) {
            var notification = self.Notification.create();
            notification.userId = self.subject && self.subject.realUser ?
              self.subject.realUser.id : self.user.id;
            notification.toastMessage = self.cls_.name + ' ' + self.EXECUTION_INVOKED;
            notification.toastState = self.ToastState.REQUESTED;
            notification.severity = foam.log.LogLevel.INFO;
            notification.transient = true;
            self.__subContext__.notificationDAO.put(notification);
            self.copyFrom(script);
            if ( script.status === self.ScriptStatus.SCHEDULED ) {
              self.poll();
            }
          }).catch(function(e) {
            var notification = self.Notification.create();
            notification.userId = self.subject && self.subject.realUser ?
              self.subject.realUser.id : self.user.id;
            notification.toastMessage = self.cls_.name + ' ' + self.EXECUTION_FAILED;
            notification.toastSubMessage = e.message || e;
            notification.toastState = self.ToastState.REQUESTED;
            notification.severity = foam.log.LogLevel.WARN;
            notification.transient = true;
            self.__subContext__.notificationDAO.put(notification);
          });
        } else {
          this.status = this.ScriptStatus.RUNNING;
          this.runScript().then(
            () => {
              var notification = this.Notification.create();
              notification.userId = this.subject && this.subject.realUser ?
                this.subject.realUser.id : this.user.id;
              notification.toastMessage = this.cls_.name + ' ' + this.EXECUTION_INVOKED;
              notification.toastState = this.ToastState.REQUESTED;
              notification.severity = foam.log.LogLevel.INFO;
              notification.transient = true;
              this.__subContext__.notificationDAO.put(notification);

              this.status = this.ScriptStatus.UNSCHEDULED;
              this.__context__[this.daoKey].put(this);
            },
            (e) => {
              var notification = this.Notification.create();
              notification.userId = this.subject && this.subject.realUser ?
                this.subject.realUser.id : this.user.id;
              notification.toastMessage = this.cls_.name + ' ' + this.EXECUTION_FAILED;
              notification.toastSubMessage = e.message || e;
              notification.toastState = this.ToastState.REQUESTED;
              notification.severity = foam.log.LogLevel.WARN;
              notification.transient = true;
              this.__subContext__.notificationDAO.put(notification);

              this.output += '\n' + e.stack;
              console.log(e);
              this.status = this.ScriptStatus.ERROR;
              this.__context__[this.daoKey].put(this);
            }
          );
        }
      }
    }
  ]
});
