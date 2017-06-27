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
  protected String property = "id";
  protected long value = 1;
  private PropertyInfo property_ = null;

  public SequenceNumberDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public SequenceNumberDAO(DAO delegate, String property) {
    setDelegate(delegate);
    this.property = property;
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
    this.value = value;
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
    getDelegate().select(sink);
    this.setValue((long) (((Max) sink).getValue() + 1.0));
  }

  public FObject put(FObject obj) {
    return put_(getX(), obj);
  }

  public FObject put_(X x, FObject obj) {
    calcDelegateMax_();
    Number val = (Number) obj.getProperty(property);
    if (val.longValue() < 1) {
      getProperty_().set(obj, this.value++);
    } else if (val.longValue() >= this.value ) {
      this.value = (long) val + 1;
    }
    return getDelegate().put(obj);
  }
}
