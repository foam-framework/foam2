/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.dao.*;
import foam.core.*;
import java.util.Date;

public class LastModifiedAwareDAO
  extends ProxyDAO
{
  public FObject put(FObject value) {
    ((LastModifiedAware) value).setLastModified(new Date());

    return super.put(value);
  }
}
