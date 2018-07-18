/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.script;

import foam.core.*;
import foam.dao.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import foam.nanos.pool.FixedThreadPool;

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

  protected Script runScript(final X x, Script newScript) {
    Script oldScript = (Script) find(newScript.getId());
    Script script    = ( oldScript == null ) ?
      newScript :
      (Script) oldScript.fclone().copyFrom(newScript);

    long estimatedTime = this.estimateWaitTime(script);
    final CountDownLatch latch = new CountDownLatch(1);

    try {
      ((FixedThreadPool) x.get("threadPool")).submit(x, new ContextAgent() {
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
          }
          // save the state
          getDelegate().put_(x, script);

          latch.countDown();
        }
      });

      latch.await(estimatedTime, TimeUnit.MILLISECONDS);

    } catch(InterruptedException e) {
      e.printStackTrace();
    }

    return script;
  }

  protected long estimateWaitTime(Script script) {
      return script.getLastRun() == null || DEFAULT_WAIT_TIME > script.getLastDuration() * 2 ?
        DEFAULT_WAIT_TIME :
        1 ; //  1 ms so it returns right away

  }
}
