/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.history;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.SequenceNumberDAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import java.util.Date;
import java.util.Iterator;
import java.util.Map;
import static foam.mlang.MLang.EQ;

public class HistoryDAO
    extends ProxyDAO
{
  protected DAO historyDAO_;

  public HistoryDAO(X x, String historyDAO, DAO delegate) {
    this(x, (DAO) x.get(historyDAO), delegate);
  }

  public HistoryDAO(X x, DAO historyDAO, DAO delegate) {
    super(x, delegate);
    historyDAO_ = historyDAO;
  }

  /**
   * Formats a User record to the following string
   * LastName, FirstName (ID)
   * @param user The user to format
   * @return The formatted string
   */
  private String formatUserName(User user) {
    return user.getLastName() +", " +
        user.getFirstName() +
        "(" + user.getId() + ")";
  }

  /**git
   * Returns an array of updated properties
   *
   * @param currentValue current value
   * @param newValue new value
   * @return array of PropertyUpdate objects
   */
  private PropertyUpdate[] getUpdatedProperties(FObject currentValue, FObject newValue) {
    Map diff = currentValue.diff(newValue);
    Iterator i = diff.keySet().iterator();

    int index = 0;
    PropertyUpdate[] updates = new PropertyUpdate[diff.keySet().size()];
    while ( i.hasNext() ) {
      String key = (String) i.next();
      PropertyInfo prop = (PropertyInfo) currentValue.getClassInfo().getAxiomByName(key);
      updates[index++] = new PropertyUpdate(key, prop.f(currentValue), diff.get(key));
    }

    return updates;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");
    FObject current = this.find_(x, obj);

    try {
      // add new history record
      Object objectId = ((PropertyInfo) obj.getClassInfo().getAxiomByName("id")).f(obj);
      HistoryRecord historyRecord = new HistoryRecord();
      historyRecord.setObjectId(objectId);
      historyRecord.setUser(formatUserName(user));
      historyRecord.setTimestamp(new Date());
      if ( current != null ) {
        historyRecord.setUpdates(getUpdatedProperties(current, obj));
      }

      historyDAO_.put_(x, historyRecord);
    } catch (Throwable t) {
      Logger l = (Logger) x.get("logger");
      l.error("Unexpected error creating history record.", t);
    }

    return super.put_(x, obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    Object objectId = ((PropertyInfo) obj.getClassInfo().getAxiomByName("id")).f(obj);
    historyDAO_.where(EQ(HistoryRecord.OBJECT_ID, objectId)).removeAll();
    return super.remove_(x, obj);
  }
}
