package foam.core;

import foam.dao.Sink;

public interface Journal extends Sink {
    public String replay(foam.core.FObject obj);
}
