/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

public abstract class AbstractDAOPropertyPropertyInfo
  extends AbstractFObjectPropertyInfo
{
  @Override
  public void toXML (FObject obj, Document doc, Element objElement) {
    return;
  }
}
