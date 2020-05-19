/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box.network;

import foam.box.Box;
import foam.core.X;
import foam.core.ContextAware;

import java.net.ServerSocket;
import java.io.IOException;

public class SocketServerBox
  extends Thread
  implement Box, ContextAware
{
  protected X x_;
  protected ServerSocket serverSocket_;
  protected int port_;
  protected Box delegate_;

  public SocketServerBox(X x, Box delegate, int port)
    throw IOException
  {
    x_ = x;
    delegate_ = delegate;
    port_ = port;
    try {
      serverSocket_ = new ServerSocket(port);
      start();
    } catch ( IOException e ) {

    }
  }

  @
}
