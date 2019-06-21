/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box;

import javax.servlet.ReadListener;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import org.apache.commons.io.IOUtils;

/**
 * HTTP request body can be read/parsed only once
 * as the client has sent it only once and won't send it multiple times.
 * The request body will be implicitly read/parsed when
 * such methods - getParameter() are invoked.
 * This RequestWrapper creates a new RequestWrapper that wraps the given request
 * by making a copy of the body of the request.
 * so it allows it with multiple methods.
 */

public class RequestWrapper extends HttpServletRequestWrapper {

  private byte[] body;

  public RequestWrapper(HttpServletRequest request) {
    super(request);

    try {
      body = IOUtils.toByteArray(request.getInputStream());
    } catch (IOException ex) {
      body = new byte[0];
    }
  }

  @Override
  public ServletInputStream getInputStream() throws IOException {
    return new ServletInputStream() {
      @Override
      public boolean isFinished() {
        return false;
      }

      @Override
      public boolean isReady() {
        return false;
      }

      @Override
      public void setReadListener(ReadListener readListener) {

      }

      ByteArrayInputStream bais = new ByteArrayInputStream(body);

      @Override
      public int read() throws IOException {
        return bais.read();
      }
    };
  }

}
