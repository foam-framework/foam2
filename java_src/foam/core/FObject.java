package foam.core;

public interface FObject
  extends ContextAware, Comparable
{
  ClassInfo getClassInfo();
  FObject fclone();
}
