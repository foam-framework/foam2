/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.Collections;
import java.util.List;

// TODO: document what this is for
public class EmptyClassInfo
  implements ClassInfo
{
  public String getId() {
    return "EmptyClassInfo";
  }

  public ClassInfo setId(String id) {
    return this;
  }

  public ClassInfo getParent() {
    return this;
  }

  public ClassInfo addProperty(PropertyInfo p) {
    return this;
  }

  @Override
  public boolean isInstance(Object o) {
    return false;
  }

  @Override
  public Object newInstance() {
    return null;
  }

  public ClassInfo setObjClass(Class cls) {
    return null;
  }

  public Class getObjClass() {
    return null;
  }

  public List getAxioms() {
    return Collections.emptyList();
  }

  public Object getAxiomByName(String name) {
    return null;
  }

  public List getAxiomsByClass(Class cls) {
    return Collections.emptyList();
  }
}
