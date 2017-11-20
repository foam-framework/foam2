/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import javax.servlet.http.HttpServletRequest;

public class HttpServletRequestBlob
    extends foam.blob.AbstractBlob
{
  protected HttpServletRequest request_;

  public HttpServletRequestBlob(HttpServletRequest request) {
    this.request_ = request;
  }

  @Override
  public Buffer read(Buffer buffer, long offset) {
    return null;
  }

  @Override
  public long getSize() {
    return request_.getContentLengthLong();
  }
}