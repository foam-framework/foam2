package foam.nanos.notification.email;

import com.google.common.base.Optional;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.dao.ListSink;
import foam.mlang.MLang;
import foam.nanos.notification.email.EmailTemplate;
import org.jtwig.resource.loader.ResourceLoader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.List;

public class DAOResourceLoader
    implements ResourceLoader
{
  public static EmailTemplate findTemplate(DAO dao, String templateName, String groupName) {
    Sink list = new ListSink();
    list = dao.where(MLang.AND(
      MLang.EQ(EmailTemplate.NAME,       templateName),
      MLang.EQ(EmailTemplate.GROUP_NAME, groupName))).limit(1).select(null);

    List data = ((ListSink) list).getData();

    if ( data.size() == 0 ) {
      list = dao.where(MLang.AND(
        MLang.EQ(EmailTemplate.NAME,     templateName),
        MLang.EQ(EmailTemplate.GROUP_NAME, "*"))).limit(1).select(null);
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
