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
  protected final FObject obj;

  public FObjectOAO(FObject obj) {
    this.obj = obj;
  }

  @Override
  public FObject get(X x) {
    return obj;
  }

  @Override
  public void setProperty(X x, String name, Object value) {
    PropertyInfo prop = (PropertyInfo) obj.getClassInfo().getAxiomByName(name);
    if ( prop != null ) prop.set(obj, value);
  }

  @Override
  public void setProperties(X x, Map values) {
    for (Object o : values.keySet()) {
      String key = (String) o;
      PropertyInfo prop = (PropertyInfo) obj.getClassInfo().getAxiomByName(key);
      if ( prop != null ) prop.set(obj, values.get(key));
    }
  }
}
