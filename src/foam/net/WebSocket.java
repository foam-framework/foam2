/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.net;

public interface WebSocket {
  public void send(String message) throws java.io.IOException;
}
