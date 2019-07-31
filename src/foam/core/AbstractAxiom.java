package foam.core;

public abstract class AbstractAxiom implements Axiom{

  protected ClassInfo parent;

  @Override
  public Axiom setClassInfo(ClassInfo p) {
    parent = p;
    return this;
  }

  @Override
  public ClassInfo getClassInfo() {
    return parent;
  }

  @Override
  public String toString() {
    // TODO: generate static string in generated instances instead to avoid creating garbage.
    return parent.getId() + "." + getName();
  }
}
