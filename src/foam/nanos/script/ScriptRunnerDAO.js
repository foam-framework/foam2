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
    'foam.nanos.logger.Logger',
    'java.util.concurrent.CountDownLatch',
    'java.util.concurrent.TimeUnit'
  ],

  constants: [
    {
      type: 'int',
      name: 'DEFAULT_WAIT_TIME',
      value: 2000
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          ` 
            public ScriptRunnerDAO(DAO delegate) {
              super();
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
        getLogger().debug("script", script.getId(), script.getStatus());
        if ( script.getStatus() == ScriptStatus.SCHEDULED ) {
          obj = this.runScript(x, script);
        }
        return obj;
      `
    },
    {
      name: 'fixScriptClass',
      type: 'foam.nanos.script.Script',
      args: [
        { type: 'foam.nanos.script.Script', name: 'script' }
      ],
      documentation: `
        Unmodelled subclasses will revert to their base-class when sent 
        to the client and back (to be shown in GUI). This method converts
        the script object back to its original class.
      `,
      javaCode: `
        Script oldScript = (Script) find(script.getId());
        return oldScript == null ?
          (Script) script.fclone() :
          (Script) oldScript.fclone().copyFrom(script);
      `
    },
    {
      name: 'runScript',
      type: 'foam.nanos.script.Script',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'foam.nanos.script.Script', name: 'newScript' }
      ],
      javaCode: `
        Script script = fixScriptClass(newScript);
        long   estimatedTime = this.estimateWaitTime(script);
        final CountDownLatch latch = new CountDownLatch(1); 

        getLogger().debug("script", script.getId(), "estimatedTime", estimatedTime);
        try {
          ((Agency) x.get("threadPool")).submit(x, new ContextAgent() {
            @Override
            public void execute(X y) {
              try {
                script.setStatus(ScriptStatus.RUNNING);
                getDelegate().put_(x, script);
                getLogger().debug("agency", "script", script.getId(), "latch", "countdown");
                latch.countDown();
                getLogger().debug("agency", "script", script.getId(), "start");
                script.runScript(x);
                getLogger().debug("agency", "script", script.getId(), "end");
                script.setStatus(ScriptStatus.UNSCHEDULED);
              } catch(Throwable t) {
                script.setStatus(ScriptStatus.ERROR);
                t.printStackTrace();
                getLogger().error("Script.run", script.getId(), t);
              }
              // save the state
              getLogger().debug("agency", "script", script.getId(), "put");
              getDelegate().put_(x, script);
            }
          }, "Run script. Script id: " + script.getId());

          getLogger().debug("script", script.getId(), "latch", "wait");
          latch.await(estimatedTime, TimeUnit.MILLISECONDS);
          getLogger().debug("script", script.getId(), "latch", "wake");
        } catch(InterruptedException e) {
          e.printStackTrace();
          getLogger().error("Script.submit", script.getId(), e);
        }
    
        return script;
      `
    },
    {
      name: 'estimateWaitTime',
      visibility: '', // passing empty string to make method package scoped
      type: 'Long',
      args: [
        { type: 'foam.nanos.script.Script', name: 'script' }
      ],
      javaCode: `
        return script.getLastRun() == null || DEFAULT_WAIT_TIME > script.getLastDuration() * 2 ?
          DEFAULT_WAIT_TIME :
          1 ; //  1 ms so it returns right away
      `
    }
  ]
});

