/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.mrac;

import foam.core.X;
import foam.nanos.logger.Logger;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.RandomAccessFile;
import java.net.Socket;
import java.util.Scanner;

public class ClusterSocketClient {

  private final Socket socket_;
  private final File journal_;
  private Long lastSequenceId = 0L;
  protected X x_;
  protected Logger logger_;

  ClusterSocketClient(X x, Socket socket, File journal) {
    x_ = x;
    logger_ = (Logger) x.get("logger");
    this.socket_ = socket;
    this.journal_ = journal;
    this.lastSequenceId = getLastSequnceNumber();
  }

  public void sync() {
    Scanner in = null;
    PrintWriter sout = null;
    BufferedWriter out = null;
    try {
      in = new Scanner(socket_.getInputStream());
      sout = new PrintWriter(socket_.getOutputStream(), true);
      out = new BufferedWriter(new FileWriter(this.journal_, true));

      //Send lastSequence
      sout.println(lastSequenceId);
      
      while (in.hasNextLine()) {
        out.newLine();
        out.write(in.nextLine());
        out.flush();
      }
      
    } catch (IOException ex) {
      logger_.error(ex);
    } finally {
      try {
        if (in != null) {
          in.close();
        }
      } catch (Exception ex) {
        logger_.error(ex);
      }
      try {
        if (sout != null) {
          sout.close();
        }
      } catch (Exception ex) {
        logger_.error(ex);
      }
      try {
        if (out != null) {
          out.close();
        }
      } catch (Exception ex) {
        logger_.error(ex);
      }
    }
  }

  private Long getLastSequnceNumber() {
    Long lastSequence = 0L;
    String lastRecord = tailJournal();
    if (lastRecord != null) {
      String sub = lastRecord.substring(lastRecord.lastIndexOf("ClusterSequenceId") + 1);
      if (sub != null) {
        sub = sub.replaceAll("\\D+", ""); // remove all noo-digit
        if (!sub.equals("")) {
          lastSequence = Long.parseLong(sub);
        }
      }
    }
    return lastSequence;
  }

  private String tailJournal() {
    RandomAccessFile fileHandler = null;
    try {
      fileHandler = new RandomAccessFile(this.journal_, "r");
      long fileLength = fileHandler.length() - 1;
      StringBuilder sb = new StringBuilder();

      for (long filePointer = fileLength; filePointer != -1; filePointer--) {
        fileHandler.seek(filePointer);
        int readByte = fileHandler.readByte();

        if (readByte == 0xA) {
          if (filePointer == fileLength) {
            continue;
          }
          break;

        } else if (readByte == 0xD) {
          if (filePointer == fileLength - 1) {
            continue;
          }
          break;
        }

        sb.append((char) readByte);
      }

      String lastLine = sb.reverse().toString();
      return lastLine;
    } catch (java.io.FileNotFoundException e) {
      logger_.error(e);
      return null;
    } catch (java.io.IOException e) {
      logger_.error(e);
      return null;
    } finally {
      if (fileHandler != null) {
        try {
          fileHandler.close();
        } catch (IOException e) {
          /* ignore */
        }
      }
    }
  }

}
