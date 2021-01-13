/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box.socket;

import foam.core.X;
import foam.core.FObject;
import foam.box.Box;
import foam.box.Message;
import foam.box.SessionServerBox;
import foam.nanos.logger.Logger;
import foam.nanos.http.ServiceWebAgent;

import java.io.InputStream;
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;

public class SocketWebAgent
  extends ServiceWebAgent
{
  public SocketWebAgent(Box skeleton, boolean authenticate) {
    super(skeleton, authenticate);
  }

  @Override
  public void execute(X x) {
    try {
      Message msg = (Message) x.get("requestMessage");
      new SessionServerBox(x, skeleton_, authenticate_).send(msg);
    } catch ( Throwable t ) {
      throw new RuntimeException(t.getMessage());
    }
  }
}
