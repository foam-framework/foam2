/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.mrac;

import foam.core.X;
import foam.nanos.logger.Logger;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.Scanner;

public class ClusterSocketServer implements Runnable {

  protected final Socket socket_;
  protected final File journal_;
  protected X x_;
  protected Logger logger_;

  ClusterSocketServer(X x, Socket socket, File journal) {
    this.socket_ = socket;
    this.journal_ = journal;
    x_ = x;
    logger_ = (Logger) x.get("logger");
  }

  @Override
  public void run() {
    Scanner in = null;
    Scanner cin = null;
    PrintWriter out = null;
    try {
      in = new Scanner(socket_.getInputStream());
      out = new PrintWriter(socket_.getOutputStream(), true);
      cin = new Scanner(this.journal_);
      while (in.hasNextLine()) {
        String lastSequence = in.nextLine();
        if (lastSequence != null) {
          Long lastSequenceNumber = Long.parseLong(lastSequence);

          while (cin.hasNextLine()) {
            Long currentSequence = 0L;
            String line = cin.nextLine();
            String sub = line.substring(line.lastIndexOf("ClusterSequenceId") + 1);
            if (sub != null) {
              sub = sub.replaceAll("\\D+", ""); // remove all non-digit
              if (!sub.equals("")) {
                currentSequence = Long.parseLong(sub);
              }
            }

            if (currentSequence > lastSequenceNumber) {
              out.println(line);
            }
          }
        }
      }
    } catch (Exception e) {
      logger_.error(e);
    } finally {
      try {
        socket_.close();
      } catch (IOException e) {
        logger_.error(e);
      }
      try {
        if (in != null) {
          in.close();
        }
      } catch (Exception ex) {
        logger_.error(ex);
      }
      try {
        if (cin != null) {
          cin.close();
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
      logger_.debug(this.getClass().getSimpleName(), "Socket Closed" + socket_, "", null);
    }
  }

}
