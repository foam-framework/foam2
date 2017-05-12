/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;
import foam.dao.*;
import foam.core.*;
import java.time.LocalDateTime;

public abstract class LastModifiedAwareDAO
  extends ProxyDAO
  implements DAO
{
  public FObject put(FObject value) {
    ((LastModifiedAware)value).lastModified = LocalDateTime.now();
    super.put(value);
  }
}
