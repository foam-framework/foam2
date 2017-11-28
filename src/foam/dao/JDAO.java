/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.*;
import foam.lib.json.ExprParser;
import foam.lib.json.JournalParser;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import foam.lib.parse.*;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.util.SafetyUtil;

import java.io.*;

public class JDAO
    extends ProxyDAO
{
  protected final File file_;
  protected final Outputter      outputter_ = new Outputter(OutputterMode.STORAGE);
  protected final BufferedWriter out_;

  public JDAO(ClassInfo classInfo, String filename)
      throws IOException
  {
    this(new MapDAO().setOf(classInfo), filename);
  }

  public JDAO(DAO delegate, String filename) throws IOException {
    file_ = new File(filename).getAbsoluteFile();

    if ( ! file_.exists() ) file_.createNewFile();

    setDelegate(delegate);
    loadJournal();

    out_ = new BufferedWriter(new FileWriter(file_, true));
  }

  protected void loadJournal()
      throws IOException
  {
    JournalParser  journalParser = new JournalParser();
    BufferedReader br            = new BufferedReader(new FileReader(file_));

    for ( String line ; ( line = br.readLine() ) != null ; ) {
      if ( SafetyUtil.isEmpty(line) ) continue;

      try {
        char operation = line.charAt(0);
        // remove first two characters and last character
        line = line.trim().substring(2, line.trim().length() - 1);

        switch ( operation ) {
          case 'p':
            FObject object = journalParser.parseObject(line);
            if ( object == null ) {
              System.err.println(getParsingErrorMessage(line) + ", source: " + line);
            } else {
              getDelegate().put(object);
            }
            break;

          case 'r':
            Object id = journalParser.parseObjectId(line);
            if ( id == null ) {
              System.err.println(getParsingErrorMessage(line));
            } else {
              getDelegate().remove(getDelegate().find(id));
            }
        }
      } catch (Throwable t) {
        System.err.println("Error reading journal line: " + line);
        t.printStackTrace();
      }
    }

    br.close();
  }

  /**
   * Gets the result of a failed parsing of a journal line
   * @param line the line that was failed to be parse
   * @return the error message
   */
  protected String getParsingErrorMessage(String line) {
    Parser parser = new ExprParser();
    PStream ps = new StringPStream();
    ParserContext x = new ParserContextImpl();

    ((StringPStream) ps).setString(line);
    x.set("X", ( getX() == null ) ? new ProxyX() : getX());

    ErrorReportingPStream eps = new ErrorReportingPStream(ps);
    ps = eps.apply(parser, x);
    return eps.getMessage();
  }

  /**
   * persists data into FileJournal then calls the delegated DAO.
   *
   * @param obj
   * @returns FObject
   */
  @Override
  public FObject put_(X x, FObject obj) {
    try {
      // TODO(drish): supress class name from output
      out_.write("p(" + outputter_.stringify(obj) + ")");
      out_.newLine();
      out_.flush();
    } catch (Throwable e) {
      e.printStackTrace();
    }

    return getDelegate().put_(x, obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    Object id = ((AbstractDAO) getDelegate()).getPrimaryKey().get(obj);

    try {
      // TODO: User Property toJSON() support when ready, since
      // this code doesn't support multi-part keys or escaping "'s in the id.
      if ( id instanceof String ) {
        out_.write("r({\"id\":\"" + id + "\"})");
      } else {
        out_.write("r({\"id\":" + id + "})");
      }

      out_.newLine();
      out_.flush();
    } catch (IOException e) {
      e.printStackTrace();
    }

    return getDelegate().remove_(x, obj);
  }

  @Override
  public void removeAll_(final X x, long skip, final long limit, Comparator order, Predicate predicate) {
    //     file.delete();

    getDelegate().select_(x, new RemoveSink(this), skip, limit, order, predicate);
    getDelegate().removeAll_(x, skip, limit, order, predicate);
  }
}
