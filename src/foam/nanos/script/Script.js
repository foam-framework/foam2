/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.script',
  name: 'Script',

  implements: ['foam.nanos.auth.EnabledAware'],

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
    'foam.core.X',
    'foam.nanos.pm.PM',
    'foam.nanos.script.jShell.EvalInstraction',
    'foam.nanos.script.jShell.InstractionPresentation',
    'jdk.jshell.JShell',
    'jdk.jshell.execution.DirectExecutionControl',
    'jdk.jshell.spi.ExecutionControl',
    'jdk.jshell.spi.ExecutionControlProvider',
    'jdk.jshell.spi.ExecutionEnv',
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
    },
    {
      javaType: 'X[]',
      name: 'X_HOLDER',
      javaValue: 'new X[1]'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
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
      documentation: 'Description of the script.'
    },
    {
      class: 'DateTime',
      name: 'lastRun',
      documentation: 'Date and time the script ran last.',
      createMode: 'HIDDEN',
      updateMode: 'RO',
      tableWidth: 140
    },
    {
      class: 'Duration',
      name: 'lastDuration',
      documentation: 'Date and time the script took to complete.',
      createMode: 'HIDDEN',
      updateMode: 'RO',
      tableWidth: 125
    },
    {
      class: 'Enum',
      of: 'foam.nanos.script.Language',
      name: 'language',
      value: foam.nanos.script.Language.BEANSHELL,
    },
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
      createMode: 'HIDDEN',
      updateMode: 'RO',
      value: 'UNSCHEDULED',
      javaValue: 'ScriptStatus.UNSCHEDULED',
      tableWidth: 100,
      storageTransient: true
    },
    {
      class: 'Code',
      name: 'code'
    },
    {
      class: 'String',
      name: 'output',
      createMode: 'HIDDEN',
      updateMode: 'RO',
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
    }
  ],

  methods: [
    {
      name: 'createInterpreter',
      args: [
        { name: 'x',  type: 'Context' },
        { name: 'ps', type: 'PrintStream' }
      ],
      javaType: 'Object',
      synchronized: true,
      javaCode: `
        Language l = getLanguage();
        if ( l == foam.nanos.script.Language.JSHELL ) {
          JShell jShell = JShell
            .builder()
            .out(ps)
            .executionEngine(new ExecutionControlProvider() {
              @Override
              public String name() {
                return "direct";
              }

              @Override
              public ExecutionControl generate(ExecutionEnv ee, Map<String, String> map) throws Throwable {
                return new DirectExecutionControl();
              }
            }, null)
            .build();

          Script.X_HOLDER[0] = x.put("out",  ps);
          jShell.eval("import foam.core.X;");
          jShell.eval("X x = foam.nanos.script.Script.X_HOLDER[0];");
          return jShell;
        } else if ( l == foam.nanos.script.Language.BEANSHELL ) {

          Interpreter shell = new Interpreter();

          try {
            shell.set("currentScript", this);
            shell.set("x", x);
            shell.eval(
                "runScript(String name) { script = x.get(\\"scriptDAO\\").find(name); if ( script != null ) eval(script.code); }");
            shell.eval("foam.core.X sudo(String user) { foam.util.Auth.sudo(x, (String) user); }");
            shell.eval("foam.core.X sudo(Object id) { foam.util.Auth.sudo(x, id); }");
          } catch (EvalError e) {
          }
          return shell;
        }

        return null;
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
        PM pm = new PM.Builder(x).setClassType(Script.getOwnClassInfo()).setName(getId()).build();
        Language l = getLanguage();

        if ( l == foam.nanos.script.Language.JSHELL ) {

          ByteArrayOutputStream baos = new ByteArrayOutputStream();
          PrintStream ps = new PrintStream(baos);

          String print = null;

          try {

            JShell jShell = (JShell) createInterpreter(x,ps);

            BufferedReader rdr = new BufferedReader(new StringReader(getCode()));
            List<String> l1 = new ArrayList<String>();

            for ( String line = rdr.readLine(); line != null; line = rdr.readLine() ) {
              l1.add(line);
            }

            List<String> instractionList = new InstractionPresentation(jShell).parseToInstraction(l1);

            EvalInstraction console = new EvalInstraction(jShell, instractionList, x);
            print = console.runEvalInstraction();
            ps.print(print);
          } catch (Throwable e) {
            e.printStackTrace();
          } finally {
            pm.log(x);
          }

          setLastRun(new Date());
          setLastDuration(pm.getTime());
          ps.flush();
          setOutput(baos.toString());
        } else { //if ( l == foam.nanos.script.Language.BEANSHELL ) {
          ByteArrayOutputStream baos = new ByteArrayOutputStream();
          PrintStream ps = new PrintStream(baos);

          Interpreter shell = (Interpreter) createInterpreter(x, null);

          // TODO: ',common packages like foam.core.*, foam.dao.*, etc.
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
          this.scriptDAO.put(this).then(function(script) {
              self.copyFrom(script);
              if ( script.status === self.ScriptStatus.RUNNING ) {
                self.poll();
              }
          });
        } else {
          this.status = this.ScriptStatus.RUNNING;
          this.runScript().then(() => {
            this.status = this.ScriptStatus.UNSCHEDULED;
            this.scriptDAO.put(this);
          }).catch((err) => {
            console.log(err);
            this.status = this.ScriptStatus.ERROR;
            this.scriptDAO.put(this);
          });
        }
      }
    }
  ]
});