package foam.core;

import foam.dao.DAO;
import foam.dao.Sink;

import java.io.IOException;

public interface Journal extends Sink {
    public void replay(DAO dao) throws IOException;
}
