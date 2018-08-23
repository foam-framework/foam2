/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.crypto.hash.Hashable;
import foam.crypto.sign.Signable;

import java.util.Map;

public interface FObject extends
  Appendable, ContextAware, Comparable, Freezable, Hashable, Signable
{
  ClassInfo getClassInfo();
  FObject copyFrom(FObject obj);
  FObject fclone();
  FObject deepClone();
  FObject shallowClone();
  Map diff(FObject obj);
  void freeze();
  boolean isFrozen();
  //Return is FObject that contain different fields between two FObjects.
  FObject hardDiff(FObject obj);
  Object setProperty(String prop, Object value);
  Object getProperty(String prop);
  boolean isPropertySet(String prop);
  boolean hasDefaultValue(String prop);
}
