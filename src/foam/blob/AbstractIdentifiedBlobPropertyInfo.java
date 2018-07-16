/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import foam.core.AbstractFObjectPropertyInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;

import java.util.Map;

public abstract class AbstractIdentifiedBlobPropertyInfo
  extends AbstractFObjectPropertyInfo
{
  @Override
  public void cloneProperty(FObject source, FObject dest) {
    // noop
  }

  @Override
  public void diff(FObject o1, FObject o2, Map diff, PropertyInfo prop) {
    // noop
  }

  @Override
  public int compare(Object o1, Object o2) {
    return 0;
  }

  @Override
  public int comparePropertyToValue(Object key, Object value) {
    return 0;
  }

  @Override
  public int comparePropertyToObject(Object key, Object o) {
    return 0;
  }
}
