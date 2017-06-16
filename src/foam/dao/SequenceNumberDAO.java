package foam.dao;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.core.PropertyInfo;
import foam.mlang.sink.Max;

public class SequenceNumberDAO
  extends ProxyDAO
{
  protected String property = "id";
  protected int value = 1;
  private PropertyInfo property_ = null;

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

  public SequenceNumberDAO setValue(int value) {
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
    Max maxSink = (Max) new Max().setArg1(getProperty_());
    ((AbstractDAO) getDelegate()).select(maxSink);
    int maxValue = (int) maxSink.getValue();
    if (maxValue < 1) return;
    this.setValue(maxValue + 1);
  }

  public FObject put_(X x, FObject obj) {
    calcDelegateMax_();
    int val = (int) getProperty_().f(obj);
    if (val < 1) {
      getProperty_().set(obj, this.value++);
    } else if (val >= this.value ) {
      this.value = (int) val + 1;
    }
    return getDelegate().put_(x, obj);
  }
}
