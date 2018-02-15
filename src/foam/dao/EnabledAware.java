/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.dao.pg.IndexedPreparedStatement;
import foam.mlang.predicate.Predicate;

import java.util.Date;

public interface EnabledAware {
  public final static Predicate ENABLED = new Predicate() {
    public boolean f(Object obj) { return true; }
    public String createStatement() { return "enabled = 't'"; }
    public void prepareStatement(IndexedPreparedStatement stmt) { }
    public foam.mlang.predicate.Predicate partialEval() { return this; }
  };

  public Date getEnabled();
  public void setEnabled(Date date);
}
