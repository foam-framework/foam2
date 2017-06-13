/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.mop;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import java.util.Map;

public class FObjectMOP
    implements MOP
{
  protected final FObject obj_;

  public FObjectMOP(FObject obj) {
    obj_ = obj;
  }

  @Override
  public FObject get(X x) {
    return obj_;
  }

  @Override
  public FObject setProperty(X x, String name, Object value) {
    obj_.setProperty(name, value);
    return obj_;
  }

  @Override
  public FObject setProperties(X x, Map values) {
    for ( Object o : values.keySet() ) {
      String key = (String) o;
      obj_.setProperty(key, values.get(key));
    }
    return obj_;
  }
}