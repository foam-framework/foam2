/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.oao;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import java.util.Map;

public class FObjectOAO
  implements OAO
{
  protected final FObject obj_;

  public FObjectOAO(FObject obj) {
    obj_ = obj;
  }

  @Override
  public FObject get(X x) {
    return obj_;
  }

  @Override
  public FObject setProperty(X x, String name, Object value) {
    PropertyInfo prop = (PropertyInfo) obj.getClassInfo().getAxiomByName(name);
    if ( prop != null ) prop.set(obj, value);
    return obj;
  }

  @Override
  public FObject setProperties(X x, Map values) {
    for (Object o : values.keySet()) {
      String key = (String) o;
      PropertyInfo prop = (PropertyInfo) obj_.getClassInfo().getAxiomByName(key);
      if ( prop != null ) prop.set(obj_, values.get(key));
    }
    return obj;
  }
}
