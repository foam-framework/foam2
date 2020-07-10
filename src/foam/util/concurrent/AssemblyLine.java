/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util.concurrent;

/**
  Usage:

  line_.enqueue(new AbstractAssembly() {
    public void startJob() {

    }

    public void executeJob() {

    }

    public void endJob() {

    }
  });
**/
public interface AssemblyLine {
  // TODO: add a lock id
  public void enqueue(Assembly job);

  /** Shutdown after processing all previously enqueued assemblies. **/
  public void shutdown();
}
