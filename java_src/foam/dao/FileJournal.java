package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.Journal;
import foam.lib.json.JournalParser;
import foam.lib.json.Outputter;

import java.io.*;

/**
 * Created by carlos on 2017-05-22.
 */
public class FileJournal implements Journal {

    protected BufferedWriter bw;
    protected BufferedReader br;
    protected File file;

    public FileJournal(String filename) throws IOException {

        this.file = new File(filename);

        if (!file.exists()) {
            file.createNewFile();
        }

        this.bw = new BufferedWriter(new FileWriter(file, true));
        this.br = new BufferedReader(new FileReader(file));
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
            // TODO(drish): supress class name from output
            Outputter outputter = new Outputter();
            this.bw.write("p(" + outputter.stringify(obj) + ")");
            this.bw.newLine();
            this.bw.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void remove(FObject obj, Detachable sub) {

    }

    /**
     * deletes the entire journal file
     */
    public void removeAll() {
        this.file.delete();
    }

    public void remove(Object id, Detachable sub) {
        try {
            Outputter outputter = new Outputter();
            this.bw.write("r({\"id\":" + id + "})");
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
     * @param delegate
     * @return
     * @throws IOException
     */
    @Override
    public void replay(DAO delegate) throws IOException {
        JournalParser journalParser = new JournalParser();

        String line;
        while ((line = this.br.readLine()) != null) {
            String operation = line.substring(0, 1);
            switch (operation) {
                case "p":
                    FObject object = journalParser.parseObject(line);
                    delegate.put(object);
                case "r":
                    Object id = journalParser.parseObjectId(line);
                    delegate.remove(delegate.find(id));
            }
        }
    }
}