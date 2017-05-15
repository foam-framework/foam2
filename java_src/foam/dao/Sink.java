// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.dao;

public interface Sink {
    public void put(foam.core.FObject obj, foam.core.Detachable sub);

    public void remove(foam.core.FObject obj, foam.core.Detachable sub);

    public void eof();

    public void reset(foam.core.Detachable sub);

}