/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.actioncommand;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.nanos.actioncommand.ActionCommand;
import java.lang.IllegalAccessException;
import java.lang.NoSuchMethodException;
import java.lang.SecurityException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class ActionCommandDAO
  extends foam.dao.ProxyDAO
{
  public Object cmd(Object obj) {
    if ( obj instanceof ActionCommand ) {
      FObject actionObj = ((ActionCommand)obj).getObject();
      try {
        // Calling method
        Method action = actionObj.getClass().getDeclaredMethod(((ActionCommand)obj).getActionName());
        action.invoke(null);
      } catch ( SecurityException | NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {

      }
    }
    return null;
  }

  public Object cmd_(X x, Object obj) {
    this.cmd(obj);
    return null;
  }
}