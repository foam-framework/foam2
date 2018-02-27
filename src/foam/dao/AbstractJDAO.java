/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.*;
import foam.lib.json.ExprParser;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import foam.lib.parse.*;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;
import foam.nanos.logger.*;
import foam.util.SafetyUtil;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.regex.Pattern;
import java.util.TimeZone;

public abstract class AbstractJDAO
  extends ProxyDAO
{
  protected Pattern COMMENT = Pattern.compile("(/\\*([^*]|[\\r\\n]|(\\*+([^*/]|[\\r\\n])))*\\*+/)|(//.*)");
  protected static final ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
      sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
      return sdf;
    }
  };

  protected final File           file_;
  protected final BufferedWriter out_;
  protected       Logger         logger_ = new StdoutLogger();

  public AbstractJDAO(foam.core.X x, ClassInfo classInfo, String filename) {
    this(x, new MapDAO(classInfo), filename);
    setOf(classInfo);
  }

  public AbstractJDAO(foam.core.X x, DAO delegate, String filename) {
    setX(x);
    setOf(delegate.getOf());

    Logger logger = logger_;

    if ( x != null ) {
      logger = (Logger) x.get("logger");

      if ( logger == null ) logger = logger_;
    }

    logger_ = new PrefixLogger(new Object[] { "[JDAO]", filename }, logger);

    try {
      file_ = getX().get(foam.nanos.fs.Storage.class).get(filename);

      if ( ! file_.exists() ) file_.createNewFile();

      setDelegate(delegate);
      loadJournal();

      out_ = new BufferedWriter(new FileWriter(file_, true));
    } catch ( IOException e ) {
      logger_.error(e);
      throw new RuntimeException(e);
    }
  }

  protected abstract Outputter getOutputter();

  protected void loadJournal()
      throws IOException
  {
    JSONParser parser = getX().create(JSONParser.class);
    BufferedReader br = new BufferedReader(new FileReader(file_));

    for ( String line ; ( line = br.readLine() ) != null ; ) {
      // skip empty lines & comment lines
      if ( SafetyUtil.isEmpty(line) ) continue;
      if ( COMMENT.matcher(line).matches() ) continue;

      try {
        char operation = line.charAt(0);
        // remove first two characters and last character
        line = line.trim().substring(2, line.trim().length() - 1);

        FObject object = parser.parseString(line);
        if ( object == null ) {
          logger_.error("parse error", getParsingErrorMessage(line), "line:", line);
          continue;
        }

        switch ( operation ) {
          case 'p':
            getDelegate().put(object);
            break;
          case 'r':
            getDelegate().remove(object);
            break;
        }
      } catch (Throwable t) {
        logger_.error("error replaying journal line:", line, t);
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
    Parser        parser = new ExprParser();
    PStream       ps     = new StringPStream();
    ParserContext x      = new ParserContextImpl();

    ((StringPStream) ps).setString(line);
    x.set("X", ( getX() == null ) ? new ProxyX() : getX());

    ErrorReportingPStream eps = new ErrorReportingPStream(ps);
    ps = eps.apply(parser, x);
    return eps.getMessage();
  }

  protected void writeComment(User user) throws IOException {
    out_.write("// Modified by ");
    out_.write(user.getFirstName());
    if ( ! SafetyUtil.isEmpty(user.getLastName()) ) {
      out_.write(" ");
      out_.write(user.getLastName());
    }
    out_.write(" (");
    out_.write(String.valueOf(user.getId()));
    out_.write(")");
    out_.write(" at ");
    out_.write(sdf.get().format(Calendar.getInstance().getTime()));
    out_.newLine();
  }

  /**
   * persists data into FileJournal then calls the delegated DAO.
   *
   * @param obj
   * @returns FObject
   */
  @Override
  public FObject put_(X x, FObject obj) {
    FObject ret = getDelegate().put_(x, obj);

    try {
      // TODO(drish): supress class name from output
      writeComment((User) x.get("user"));
      out_.write("p(" + getOutputter().stringify(ret) + ")");
      out_.newLine();
      out_.flush();
    } catch (Throwable e) {
      logger_.error("put", e);
    }

    return ret;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    Object  id  = getPrimaryKey().get(obj);
    FObject ret = getDelegate().remove_(x, obj);

    try {
      writeComment((User) x.get("user"));
      // TODO: Would be more efficient to output the ID portion of the object.  But
      // if ID is an alias or multi part id we should only output the
      // true properties that ID/MultiPartID maps too.
      out_.write("r(" + getOutputter().stringify(ret) + ")");
      out_.newLine();
      out_.flush();
    } catch (IOException e) {
      logger_.error("remove", e);
    }

    return ret;
  }

  @Override
  public void removeAll_(final X x, long skip, final long limit, Comparator order, Predicate predicate) {
    //     file.delete();

    getDelegate().select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
    getDelegate().removeAll_(x, skip, limit, order, predicate);
  }
}
