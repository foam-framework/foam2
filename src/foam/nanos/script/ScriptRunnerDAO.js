/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.script',
  name: 'ScriptRunnerDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.*',
    'foam.dao.*',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          ` 
            public ScriptRunnerDAO(DAO delegate) {
              setDelegate(delegate);
            }
          `
        );
      }
    }
  ],

  properties: [
        {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `
        Script script = (Script) getDelegate().put_(x, obj);
        getLogger().debug("put", script.getId(), script.getStatus());
        if ( script.getStatus() == ScriptStatus.SCHEDULED ) {
          this.runScript(x, script);
        }
        return script;
      `
    },
    {
      name: 'runScript',
      type: 'foam.nanos.script.Script',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'foam.nanos.script.Script', name: 'script' }
      ],
      javaCode: `
          ((Agency) x.get("threadPool")).submit(x, new ContextAgent() {
            @Override
            public void execute(X y) {
              Script s = (Script) script.fclone();
              try {
                s.setStatus(ScriptStatus.RUNNING);
                s = (Script) getDelegate().put_(x, s);
                getLogger().debug("agency", s.getId(), "start");
                s.runScript(x);
                getLogger().debug("agency", s.getId(), "end");
                s.setStatus(ScriptStatus.UNSCHEDULED);
              } catch(Throwable t) {
                t.printStackTrace();
                s.setStatus(ScriptStatus.ERROR);
                getLogger().error("agency", s.getId(), t);
              } finally {
                getDelegate().put_(x, s);
              }
            }
          }, "Run script: " + script.getId());
        return script;
      `
    }
  ]
});

