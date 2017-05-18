/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.dao.*;
import foam.core.*;
import foam.nanos.auth.LastModifiedAware;
import java.time.LocalDateTime;

public class LastModifiedAwareDAO
  extends ProxyDAO
  implements LastModifiedAware
{
  public FObject put(FObject value) {
    ((LastModifiedAware)value).lastModified = LocalDateTime.now();
    super.put(value);
    return value;
  }
}
