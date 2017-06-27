/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.Map;

public interface FObject
  extends ContextAware, Comparable
{
  ClassInfo getClassInfo();
  FObject fclone();
  Map diff(FObject obj);
  Object setProperty(String prop, Object value);
  Object getProperty(String prop);
}
