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
    'foam.nanos.auth.LastModifiedByAware'
  ],

  requires: [
    'foam.nanos.script.ScriptStatus',
    'foam.nanos.notification.notifications.ScriptRunNotification'
  ],

  imports: [
    'notificationDAO',
    'scriptDAO',
    'user'
  ],

  javaImports: [
    'bsh.EvalError',
    'bsh.Interpreter',
    'foam.core.*',
    'foam.dao.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.auth.*',
    'foam.nanos.pm.PM',
    'java.io.ByteArrayOutputStream',
    'java.io.PrintStream',
    'java.util.Date',
    'static foam.mlang.MLang.*',
  ],

  tableColumns: [
    'id', 'server', 'description', 'lastDuration', 'status', 'run'
  ],

  searchColumns: ['id', 'description'],

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
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      tableWidth: 280
    },
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: 'Enables script.',
      tableCellFormatter: function(value) {
        this.start()
          .style({ color: value ? 'green' : 'gray' })
          .add(value ? 'Y' : 'N')
        .end();
      },
      tableWidth: 90,
      value: true
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of the script.',
      tableWidth: 200
    },
    {
      class: 'Int',
      name: 'priority',
      value: 5,
      javaValue: 5,
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          [ 4, 'Low'    ],
          [ 5, 'Medium' ],
          [ 6, 'High'   ]
        ]
      }
    },
    {
      class: 'DateTime',
      name: 'lastRun',
      documentation: 'Date and time the script ran last.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableWidth: 140
    },
    {
      class: 'Duration',
      name: 'lastDuration',
      documentation: 'Date and time the script took to complete.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableWidth: 125
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
      documentation: 'Runs on server side if enabled.',
      value: true,
      tableWidth: 80
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
      tableWidth: 100,
      storageTransient: true
    },
    {
      class: 'Code',
      name: 'code',
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'output',
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
      `
    },
    {
      class: 'String',
      name: 'notes',
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 144 }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: 'User who last modified script'
    },
    {
      class: 'String',
      name: 'daoKey',
      value: 'scriptDAO',
      visibility: 'HIDDEN',
      documentation: `Name of dao which journal will be used to store script run logs. To set from inheritor
      just change property value`
    }
  ],

  methods: [
    {
      name: 'createInterpreter',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaType: 'Interpreter',
      javaCode: `
        Interpreter shell = new Interpreter();

        try {
          shell.set("currentScript", this);
          shell.set("x", x);
          shell.eval("runScript(String name) { script = x.get(\\"scriptDAO\\").find(name); if ( script != null ) eval(script.code); }");
          shell.eval("foam.core.X sudo(String user) { foam.util.Auth.sudo(x, (String) user); }");
          shell.eval("foam.core.X sudo(Object id) { foam.util.Auth.sudo(x, id); }");
        } catch (EvalError e) {}

        return shell;
      `
    },
    {
      name: 'runScript',
      code: function() {
        var log = function() {
          this.output += Array.from(arguments).join('') + '\n';
        }.bind(this);
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
        Thread.currentThread().setPriority(getPriority());
        try {
          ByteArrayOutputStream baos  = new ByteArrayOutputStream();
          PrintStream           ps    = new PrintStream(baos);
          Interpreter           shell = createInterpreter(x);
          PM                    pm    = new PM.Builder(x).setClassType(Script.getOwnClassInfo()).setName(getId()).build();

          // TODO: import common packages like foam.core.*, foam.dao.*, etc.
          try {
            setOutput("");
            shell.setOut(ps);
            shell.eval(getCode());
          } catch (Throwable e) {
            ps.println();
            e.printStackTrace(ps);
            Logger logger = (Logger) x.get("logger");
            logger.error(e);
          } finally {
            pm.log(x);
          }

          setLastRun(new Date());
          setLastDuration(pm.getTime());
          ps.flush();
          setOutput(baos.toString());
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
            self.scriptDAO.find(self.id).then(function(script) {
              if ( script.status !== self.ScriptStatus.RUNNING ) {
                self.copyFrom(script);
                clearInterval(interval);

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
      tableWidth: 70,
      confirmationRequired: true,
      code: function() {
        var self = this;
        this.output = '';
        this.status = this.ScriptStatus.SCHEDULED;
        if ( this.server ) {
          this.__context__[this.daoKey].put(this).then(function(script) {
              self.copyFrom(script);
              if ( script.status === self.ScriptStatus.RUNNING ) {
                self.poll();
              }
          });
        } else {
          this.status = this.ScriptStatus.RUNNING;
          this.runScript().then(() => {
            this.status = this.ScriptStatus.UNSCHEDULED;
            this.__context__[this.daoKey].put(this);
          }).catch((err) => {
            console.log(err);
            this.status = this.ScriptStatus.ERROR;
            this.__context__[this.daoKey].put(this);
          });
        }
      }
    }
  ]
});
