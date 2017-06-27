package foam.dao;

import foam.mlang.predicate.Predicate;
import java.util.Date;

public interface EnabledAware {
  public final static Predicate ENABLED = new Predicate() {
    public boolean f(foam.core.FObject obj) { return true; }
    public String createStatement() { return ""; }
    public foam.mlang.predicate.Predicate partialEval() { return this; }
  };

  public Date getEnabled();
  public void setEnabled(Date date);
}
