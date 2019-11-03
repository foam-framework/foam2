/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.script;

import foam.core.*;
import foam.dao.*;
import foam.nanos.logger.Logger;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class ScriptRunnerDAO
  extends ProxyDAO
{
  final public static int DEFAULT_WAIT_TIME = 2000;

  public ScriptRunnerDAO(DAO delegate) {
    super();
    setDelegate(delegate);
  }

  public FObject put_(final X x, FObject obj) {
    Script script = (Script) obj;

    if ( script.getStatus() == ScriptStatus.SCHEDULED ) {
      obj = this.runScript(x, script);
    }

    return getDelegate().put_(x, obj);
  }

  /**
   * Unmodelled subclasses will revert to their base-class when sent
   * to the client and back (to be shown in GUI). This method converts
   * the script object back to its original class.
   **/
  Script fixScriptClass(Script script) {
    Script oldScript = (Script) find(script.getId());
    return oldScript == null ?
      (Script) script.fclone() :
      (Script) oldScript.fclone().copyFrom(script);
  }

  Script runScript(final X x, Script newScript) {
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
  }

  long estimateWaitTime(Script script) {
    return script.getLastRun() == null || DEFAULT_WAIT_TIME > script.getLastDuration() * 2 ?
      DEFAULT_WAIT_TIME :
      1 ; //  1 ms so it returns right away

  }
}
