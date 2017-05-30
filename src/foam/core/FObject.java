package foam.core;

public interface FObject
  extends ContextAware, Comparable
{
  public ClassInfo getClassInfo();
}
