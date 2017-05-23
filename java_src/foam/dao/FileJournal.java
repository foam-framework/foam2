package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.Journal;

import java.io.FileDescriptor;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

/**
 * Created by carlos on 2017-05-22.
 */
public class FileJournal implements Journal {

    protected FileDescriptor fd;
    protected FileWriter fout;
    protected FileReader fin;

    public FileJournal(FileDescriptor fd) {
        this.fd = fd;
        this.fout = new FileWriter(fd);
        this.fin = new FileReader(fd);
    }

    /**
     * Persists data into the File System.
     *
     * @param obj
     * @param sub
     */
    @Override
    public void put(FObject obj, Detachable sub) {
        try {
            fout.write("put(foam.json.parse(" + obj.toString() + "));\\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
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

    /**
     * "replays" the persisted journaled file history into a dao.
     *
     * @param sink
     * @return
     * @throws IOException
     */
    @Override
    public String replay(Sink sink) throws IOException {
        return null;
    }
}
