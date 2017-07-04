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
