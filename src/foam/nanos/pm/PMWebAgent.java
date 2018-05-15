/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.X;
import foam.nanos.http.ProxyWebAgent;
import foam.nanos.http.WebAgent;

public class PMWebAgent
  extends ProxyWebAgent
{
  protected final Class  cls_;
  protected final String name_;

  public PMWebAgent(WebAgent delegate) {
    this(delegate.getClass(), "execute", delegate);
  }

  public PMWebAgent(Class cls, String name, WebAgent delegate) {
    setDelegate(delegate);
    cls_  = cls;
    name_ = name;
  }

  public void execute(X x) {
    PM pm = new PM(cls_, name_);

    try {
      getDelegate().execute(x);
    } finally {
      pm.log(x);
    }
  }
}
