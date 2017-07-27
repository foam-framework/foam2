/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.X;
import foam.core.ClassInfo;
import foam.core.FObject;
import java.lang.reflect.Method;
import java.lang.SecurityException;
import java.lang.NoSuchMethodException;
import java.lang.IllegalAccessException;
import java.lang.reflect.InvocationTargetException;

public class ActionCommandDAO
  extends ProxyDAO
{
  public Object cmd(Object obj) {
    if ( obj instanceof foam.core.ActionCommand ) {
      FObject actionObj = ((foam.core.ActionCommand)obj).getObject();
      try {
        // Calling method
        Method action = actionObj.getClass().getDeclaredMethod(((foam.core.ActionCommand)obj).getActionName());
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