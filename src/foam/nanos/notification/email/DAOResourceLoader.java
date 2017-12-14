package foam.nanos.notification.email;

import com.google.common.base.Optional;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.dao.ListSink;
import foam.nanos.notification.email.EmailTemplate;
import foam.util.SafetyUtil;
import org.jtwig.resource.loader.ResourceLoader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.List;

import static foam.mlang.MLang.*;

public class DAOResourceLoader
    implements ResourceLoader
{
  public static EmailTemplate findTemplate(DAO dao, String templateName, String groupName) {
    Sink list;
    List data;

    // if group is provided, query based on that
    if ( ! SafetyUtil.isEmpty(groupName) ) {
      list = dao.where(AND(
          EQ(EmailTemplate.NAME, templateName),
          EQ(EmailTemplate.GROUP, groupName))).limit(1).select(null);
    } else {
      list = dao.where(AND(
          EQ(EmailTemplate.NAME,  templateName),
          EQ(EmailTemplate.GROUP, "*"))).limit(1).select(null);
    }

    // if list is null, return null
    if ( list == null ) {
      return null;
    }

    // if list is empty, return null
    data = ((ListSink) list).getData();
    if ( data == null || data.size() == 0 ) {
      return null;
    }

    return (EmailTemplate) data.get(0);
  }

  protected DAO dao_;
  protected String groupName_;

  public DAOResourceLoader(DAO dao, String groupName) {
    dao_ = dao;
    groupName_ = groupName;
  }

  @Override
  public Optional<Charset> getCharset(String s) {
    return Optional.absent();
  }

  @Override
  public InputStream load(String s) {
    EmailTemplate template = DAOResourceLoader.findTemplate(dao_, s, groupName_);

    return template == null ? null : new ByteArrayInputStream(template.getBodyAsByteArray());
  }

  @Override
  public boolean exists(String s) {
    return load(s) != null;
  }

  @Override
  public Optional<URL> toUrl(String s) {
    return Optional.absent();
  }
}
