/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 package foam.lib.formatter;

import foam.core.ClassInfo;
import foam.core.ContextAware;
import foam.core.FEnum;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.lib.PropertyPredicate;
import java.util.*;

public interface FObjectFormatter
  extends ContextAware
{
  public void setX(X x);

  public X getX();

  public StringBuilder builder();

  public void reset();

  public String stringify(FObject obj);

  public String stringifyDelta(FObject oldFObject, FObject newFObject);

  public void outputDelta(FObject oldFObject, FObject newFObject);

  public void output(String val);

  public void output(short val);

  public void output(int val);

  public void output(long val);

  public void output(float val);

  public void output(double val);

  public void output(boolean val);

  public void output(String[] arr);

  public void output(FObject[] arr, ClassInfo defaultClass);

  public void output(FObject[] arr);

  public void output(Object[] arr);

  public void output(byte[] arr);

  public void output(Map map);

  public void output(List list);

  public void outputEnum(FEnum val);

  public void output(Object val);

  public void output(FObject val);

  public void output(FObject val, ClassInfo defaultClass);

  public void output(Date val);

  public void output(ClassInfo val);

  public void output(PropertyInfo val);

  public void setPropertyPredicate(PropertyPredicate p);
}
