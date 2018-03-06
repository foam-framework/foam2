/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import foam.core.AbstractFObjectPropertyInfo;
import foam.core.FObject;

public abstract class AbstractBlobPropertyInfo
    extends AbstractFObjectPropertyInfo
{
  @Override
  public void cloneProperty(FObject source, FObject dest) {}
}