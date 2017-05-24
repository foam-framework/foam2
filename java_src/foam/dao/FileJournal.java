package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.Journal;
import foam.lib.json.Outputter;

import java.io.*;

/**
 * Created by carlos on 2017-05-22.
 */
public class FileJournal implements Journal {

    protected FileWriter fout;
    protected BufferedWriter bw;
    protected FileReader fin;
    protected File file;

    public FileJournal(String filename) throws IOException {

        this.file = new File(filename);

        if (!file.exists()) {
            file.createNewFile();
        }

        this.fin = new FileReader(file);
        this.fout = new FileWriter(file, true);
        this.bw = new BufferedWriter(this.fout);
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
            Outputter outputter = new Outputter();
            this.bw.write("put(foam.json.parse(" + outputter.stringify(obj) + "))");
            this.bw.newLine();
            this.bw.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * deletes the entire journal file
     */
    public void removeAll() {
        this.file.delete();
    }

    @Override
    public void remove(FObject obj, Detachable sub) {
        try {
            Outputter outputter = new Outputter();
            this.bw.write("remove(foam.json.parse(" + outputter.stringify(obj) + "))");
            this.bw.newLine();
            this.bw.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
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
