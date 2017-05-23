package foam.dao;

import foam.core.FObject;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

import java.io.IOException;
import java.io.RandomAccessFile;

/**
 * Created by carlos on 2017-05-22.
 */
public class JournaledDAO extends ProxyDAO {

    private FileJournal journal;

    public JournaledDAO(DAO delegate, String filename) throws IOException {

        RandomAccessFile file = new RandomAccessFile(filename, "rw");
        FileJournal fileJournal = new FileJournal(file.getFD());
        this.journal = fileJournal;
        this.setDelegate(delegate);
    }

    /**
     *
     * persists data into FileJournal then calls the delegated DAO.
     *
     * @param obj
     * @returns FObject
     */
    @Override
    public FObject put(FObject obj) {
        this.journal.put(obj, null);
        return this.getDelegate().put(obj);
    }

    @Override
    public FObject remove(FObject obj) {
        this.journal.remove(obj, null);
        return this.getDelegate().remove(obj);
    }

    @Override
    public FObject find(Object id) {
        return null;
    }

    @Override
    public Sink select(Sink sink, Integer skip, Integer limit, Comparator order, Predicate predicate) {
        return null;
    }

    @Override
    public void removeAll(Integer skip, Integer limit, Comparator order, Predicate predicate) {

    }
}
