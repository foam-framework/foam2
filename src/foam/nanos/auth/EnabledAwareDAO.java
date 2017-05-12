/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;
import foam.dao.*;
import foam.core.*;
import foam.nanos.auth.EnabledAware;

public class EnabledAwareDAO
  extends FilteredDAO
  implements DAO, EnabledAware
{
  public DAO predicate() {
    if (this.enabled == true) {
      return this;
    }
    return null;
  }
}
