/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.history;

import foam.core.FObject;
import foam.core.X;
import foam.core.PropertyInfo;
import foam.dao.ProxyDAO;
import foam.dao.SequenceNumberDAO;
import foam.nanos.auth.User;

import java.util.Date;
import java.util.Iterator;
import java.util.Map;

import static foam.mlang.MLang.EQ;

public class HistoryDAO
  extends ProxyDAO
{

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

  /**
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

      PropertyUpdate update = new PropertyUpdate()
          .setName(key)
          .setOldValue(prop.f(currentValue))
          .setNewValue(diff.get(key));
      updates[index++] = update;
    }

    return updates;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // TODO: use context-oriented context when available.
    User user = (User) getX().get("user");
    SequenceNumberDAO historyDAO = (SequenceNumberDAO) getX().get("historyDAO");
    FObject current = this.find_(x, obj);

    // add new history record
    Object objectId = ((PropertyInfo) obj.getClassInfo().getAxiomByName("id")).f(obj);
    HistoryRecord historyRecord = new HistoryRecord();
    historyRecord.setObjectId(objectId);
    historyRecord.setUser(formatUserName(user));
    historyRecord.setTimestamp(new Date());
    historyRecord.setUpdates(getUpdatedProperties(current, obj));
    historyDAO.put_(x, historyRecord);

    return super.put_(x, obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    // TODO: use context-oriented context when available.
    Object objectId = ((PropertyInfo) obj.getClassInfo().getAxiomByName("id")).f(obj);
    SequenceNumberDAO historyDAO = (SequenceNumberDAO) getX().get("historyDAO");
    historyDAO.where(EQ(HistoryRecord.OBJECT_ID, objectId)).removeAll();
    return super.remove_(x, obj);
  }
}
