package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.Journal;

public class JournaledDAO implements Journal {
    @Override
    public void put(FObject obj, Detachable sub) {

    }

    @Override
    public void remove(FObject obj, Detachable sub) {

    }

    @Override
    public void eof() {

    }

    @Override
    public void reset(Detachable sub) {

    }

    @Override
    public String replay(FObject obj) {
        return null;
    }
}
