/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.audit;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.ProxyDAO;
import foam.lib.json.Outputter;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class AuditDAO
  extends ProxyDAO
{
  protected final Outputter outputter = new Outputter(getX());

  /**
   * Creates a format message containing the
   * list of properties that have changed
   *
   * @param currentValue current value
   * @param newValue new value
   * @return String array of changes
   */
  String formatMessage(FObject currentValue, FObject newValue) {
    Map          diff   = currentValue.diff(newValue);
    Iterator     i      = diff.keySet().iterator();
    List<String> result = new ArrayList<>();

    while ( i.hasNext() ) {
      String key = (String) i.next();
      result.add(key + ": [" + currentValue.getProperty(key) + "," + diff.get(key) + "]");
    }

    return result.toString();
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User    user     = ((Subject) x.get("subject")).getUser();
    Logger  logger   = (Logger) x.get("logger");
    FObject current  = this.find_(x, obj);
    Object  objectId = obj.getProperty("id");

    logger.info("CHANGE", objectId, user.getId(), formatMessage(current, obj));

    return super.put_(x, obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User   user     = ((Subject) x.get("subject")).getUser();
    Logger logger   = (Logger) x.get("logger");
    Object objectId = obj.getProperty("id");

    outputter.output(obj);
    logger.info("REMOVE", objectId, user.getId(), outputter.toString());

    return super.remove_(x, obj);
  }
}
