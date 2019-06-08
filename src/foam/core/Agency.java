package foam.core;
/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *   http://www.apache.org/licenses/LICENSE-2.0
 */


public interface Agency {
  public void submit(foam.core.X x, foam.core.ContextAgent agent);
  public void submit(foam.core.X x, foam.core.ContextAgent agent, String description);
}