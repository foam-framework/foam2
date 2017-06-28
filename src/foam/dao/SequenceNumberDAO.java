package foam.dao;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.core.PropertyInfo;
import foam.mlang.MLang;
import foam.mlang.sink.Max;

public class SequenceNumberDAO
    extends ProxyDAO
{
  protected long value_ = 1;
  protected boolean isValueSet_ = false;

  protected String property = "id";
  private PropertyInfo property_ = null;

  public SequenceNumberDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public SequenceNumberDAO(PropertyInfo property, DAO delegate) {
    setDelegate(delegate);
    this.property_ = property;
    this.property = property.getName();
  }

  public AbstractDAO setOf(ClassInfo of) {
    AbstractDAO ret = super.setOf(of);
    this.property_ = null;
    return ret;
  }

  public SequenceNumberDAO setProperty(String property) {
    this.property = property;
    this.property_ = null;
    return this;
  }

  public SequenceNumberDAO setValue(long value) {
    value_ = value;
    return this;
  }

  private PropertyInfo getProperty_() {
    if (property_ == null) {
      property_ = (PropertyInfo) this.of_.getAxiomByName(property);
    }

    return property_;
  }

  /**
   * Calculates the next largest value in the sequence
   */
  private void calcDelegateMax_() {
    Sink sink = MLang.MAX(getProperty_());
    sink = getDelegate().select(sink);
    setValue((long) (((Max) sink).getValue() + 1.0));
    isValueSet_ = true;
  }

  public FObject put(FObject obj) {
    if ( ! isValueSet_ )
      calcDelegateMax_();
    return put_(getX(), obj);
  }

  public FObject put_(X x, FObject obj) {
    Number val = (Number) obj.getProperty(property);
    if ( val.longValue() < 1 ) {
      getProperty_().set(obj, value_++);
    } else if ( val.longValue() >= value_ ) {
      setValue(val.longValue() + 1);
    }
    return getDelegate().put(obj);
  }
}
