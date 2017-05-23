package foam.core;

import foam.dao.Sink;

import java.io.IOException;

public interface Journal extends Sink {
    public String replay(Sink sink) throws IOException;
}
