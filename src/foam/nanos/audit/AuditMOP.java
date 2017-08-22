/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.audit;

import foam.core.FObject;
import foam.core.X;
import foam.mop.ProxyMOP;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import java.util.*;

public class AuditMOP
  extends ProxyMOP
{
  /**
   * Creates a formatted message containing the list
   * of properties that have been changed
   *
   * @param obj the original object
   * @param values map of property name to new values
   * @return String array of changes
   */
  private String formatMessage(FObject obj, Map values) {
    List<String> result = new ArrayList<>();
    for ( Object o : values.keySet() ) {
      String key = (String) o;
      result.add(key + ": [" + obj.getProperty(key) + "," + values.get(key) + "]");
    }
    return result.toString();
  }

  @Override
  public FObject setProperty(X x, String name, Object value) {
    User       user     = (User) x.get("user");
    Logger     logger   = (Logger) x.get("logger");
    FObject    obj      = getDelegate().get(x);
    Object     objectId = obj.getProperty("id");
    Map        values   = new HashMap();

    values.put(name, value);
    logger.info("CHANGE", objectId, user.getId(), formatMessage(obj, values));

    return super.setProperty(x, name, value);
  }

  @Override
  public FObject setProperties(X x, Map values) {
    User       user     = (User) x.get("user");
    Logger     logger   = (Logger) x.get("logger");
    FObject    obj      = getDelegate().get(x);
    Object     objectId = obj.getProperty("id");

    logger.info("CHANGE", objectId, user.getId(), formatMessage(obj, values));

    return super.setProperties(x, values);
  }
}
