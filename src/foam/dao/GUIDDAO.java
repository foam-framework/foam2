/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.mlang.MLang;
import foam.mlang.sink.Max;
import java.util.UUID;

public class GUIDDAO
  extends ProxyDAO
{
  protected String       property  = "id";
  protected PropertyInfo property_ = null;

  public GUIDDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public GUIDDAO(PropertyInfo property, DAO delegate) {
    setDelegate(delegate);
    property_ = property;
    this.property = property.getName();
  }

  public void setOf(ClassInfo of) {
    super.setOf(of);
    property_ = null;
  }

  public GUIDDAO setProperty(String property) {
    this.property = property;
    property_ = null;

    return this;
  }

  private PropertyInfo getProperty_() {
    if ( property_ == null )
      property_ = (PropertyInfo) getDelegate().getOf().getAxiomByName(property);

    return property_;
  }

  public FObject put_(X x, FObject obj) {
    Object val = obj.getProperty(property);

    if ( "".equals(val) ) {
      getProperty_().set(obj, UUID.randomUUID().toString());
    }

    return getDelegate().put_(x, obj);
  }
}
