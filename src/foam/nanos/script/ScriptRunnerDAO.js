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

  methods: [
    {
      name: 'put_',
      javaCode: `
        Script script = (Script) obj;

        if ( script.getStatus() == ScriptStatus.SCHEDULED ) {
          obj = this.runScript(x, script);
        }
    
        return getDelegate().put_(x, obj);
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
        Logger log = (Logger) x.get("logger");
        Script script = fixScriptClass(newScript);
        long   estimatedTime = this.estimateWaitTime(script);
        final CountDownLatch latch = new CountDownLatch(1);
    
        try {
          ((Agency) x.get("threadPool")).submit(x, new ContextAgent() {
            @Override
            public void execute(X y) {
              try {
                script.setStatus(ScriptStatus.RUNNING);
                getDelegate().put_(x, script);
                script.runScript(x);
                script.setStatus(ScriptStatus.UNSCHEDULED);
              } catch(Throwable t) {
                script.setStatus(ScriptStatus.ERROR);
                t.printStackTrace();
                log.error("Script.run", script.getId(), t);
              }
              // save the state
              getDelegate().put_(x, script);
    
              latch.countDown();
            }
          }, "Run script. Script id: " + script.getId());
    
          latch.await(estimatedTime, TimeUnit.MILLISECONDS);
        } catch(InterruptedException e) {
          e.printStackTrace();
          log.error("Script.submit", script.getId(), e);
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

