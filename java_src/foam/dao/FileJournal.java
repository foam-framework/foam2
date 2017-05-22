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

    private FileDescriptor fd;
    private FileWriter fin;
    private FileReader fout;

    public FileJournal(FileDescriptor fd) {
        this.fd = fd;
        this.fin = new FileWriter(fd);
        this.fout = new FileReader(fd);
    }

    public FileDescriptor getFd() {
        return fd;
    }

    public void setJournal(FileDescriptor fd) {
        this.fd = fd;
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
            fin.write("Persistind data into file.");
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

    @Override
    public String replay(FObject obj) throws IOException {
        return null;
    }
}
