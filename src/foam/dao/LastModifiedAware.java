/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.mlang.predicate.Predicate;
import java.util.Date;

public interface LastModifiedAware {
  public Date getLastModified();
  public void setLastModified(Date date);
}
