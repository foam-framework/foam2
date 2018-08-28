package foam.dao.index;

public class PersistedState {

  protected long position_ = -1;
  protected Object value_ = null;

  public PersistedState() {

  }

  public PersistedState(Object value) {
    value_ = value;
  }

  public long getPosition() {
    return position_;
  }

  public void setPosition(long position) {
    position_ = position;
  }

  public Object getValue() {
    return value_;
  }

  public void setValue_(Object value) {
    value_ = value;
  }
}
