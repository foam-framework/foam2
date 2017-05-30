/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.Journal;
import java.io.*;
import foam.lib.json.JournalParser;
import foam.lib.json.Outputter;

public class FileJournal
  implements Journal
{
  protected BufferedWriter bw;
  protected BufferedReader br;
  protected File           file;

  public FileJournal(String filename) throws IOException {

    file = new File(filename);

    if ( ! file.exists() ) {
      file.createNewFile();
    }

    bw = new BufferedWriter(new FileWriter(file, true));
    br = new BufferedReader(new FileReader(file));
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
      bw.write("p(" + outputter.stringify(obj) + ")");
      bw.newLine();
      bw.flush();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  /**
   * deletes the entire journal file
   */
  public void removeAll() {
    file.delete();
  }

  public void remove(FObject obj, Detachable sub) {
  }

  public void remove(Object id, Detachable sub) {
    try {
      bw.write("r({\"id\":" + id + "})");
      bw.newLine();
      bw.flush();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @Override
  public void eof() {}

  @Override
  public void reset(Detachable sub) {}

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
    while ( ( line = br.readLine() ) != null ) {
      String operation = line.substring(0, 1);
      switch (operation) {
        case "p":
          FObject object = journalParser.parseObject(line);
          delegate.put(object);
          break;
        case "r":
          Object id = journalParser.parseObjectId(line);
          delegate.remove(delegate.find(id));
      }
    }
  }
}
