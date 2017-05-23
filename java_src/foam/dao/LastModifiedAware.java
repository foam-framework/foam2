package foam.dao;

import foam.mlang.predicate.Predicate;
import java.util.Date;

public interface LastModifiedAware {
  public Date getLastModified();
  public void setLastModified(Date date);
}
