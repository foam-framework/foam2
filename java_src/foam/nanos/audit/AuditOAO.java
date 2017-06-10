/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.audit;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.nanos.auth.User;
import foam.nanos.logger.NanoLogger;
import foam.oao.ProxyOAO;

import java.util.*;

public class AuditOAO
  extends ProxyOAO
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
      PropertyInfo prop = (PropertyInfo) obj.getClassInfo().getAxiomByName(key);
      result.add(key + ": [" + prop.f(obj) + "," + values.get(key) + "]");
    }
    return result.toString();
  }

  @Override
  public void setProperty(X x, String name, Object value) {
    User user = (User) x.get("user");
    NanoLogger logger = (NanoLogger) x.get("logger");
    FObject obj = getDelegate().get(x);
    Object objectId = ((PropertyInfo) obj.getClassInfo().getAxiomByName("id")).f(obj);
    Map values = new HashMap();
    values.put(name, value);
    logger.info("CHANGE", objectId, user.getId(), formatMessage(obj, values));
    super.setProperty(x, name, value);
  }

  @Override
  public void setProperties(X x, Map values) {
    User user = (User) x.get("user");
    NanoLogger logger = (NanoLogger) x.get("logger");
    FObject obj = getDelegate().get(x);
    Object objectId = ((PropertyInfo) obj.getClassInfo().getAxiomByName("id")).f(obj);
    logger.info("CHANGE", objectId, user.getId(), formatMessage(obj, values));
    super.setProperties(x, values);
  }
}
