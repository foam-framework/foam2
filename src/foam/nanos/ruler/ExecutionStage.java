/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.ruler;

import foam.core.ContextAgent;
import foam.core.X;
import foam.nanos.pool.FixedThreadPool;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.atomic.AtomicBoolean;

public class ExecutionStage {
  private CompletionStage stage_      = null;
  private AtomicBoolean   isCancelled = new AtomicBoolean(false);

  public void submit(X x, ContextAgent agent) {
    if ( isCancelled.get() ) {
      return;
    }

    FixedThreadPool threadPool = (FixedThreadPool) x.get("threadPool");
    Runnable action = () -> agent.execute(x);
    stage_ = stage_ == null
      ? CompletableFuture.runAsync(action, threadPool.getPool())
      : stage_.thenRunAsync(action);
  }

  public void cancel() {
    isCancelled.set(true);
  }
}
