package foam.nanos.notification.email;

import com.google.common.base.Optional;
import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.dao.ArraySink;
import foam.nanos.auth.Group;
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
    extends ContextAwareSupport
    implements ResourceLoader
{
  public static EmailTemplate findTemplate(X x, String name, String groupId) {
    DAO groupDAO = (DAO) x.get("groupDAO");
    DAO emailTemplateDAO = (DAO) x.get("emailTemplateDAO");

    do {
      Sink sink = emailTemplateDAO.where(AND(
          EQ(EmailTemplate.NAME, name),
          EQ(EmailTemplate.GROUP, ! SafetyUtil.isEmpty(groupId) ? groupId : "*")
      )).limit(1).select(null);

      List data = ((ArraySink) sink).getArray();
      if ( data != null && data.size() == 1 ) {
        return (EmailTemplate) data.get(0);
      }

      // exit condition, no emails even with wildcard group so return null
      if ( "*".equals(groupId) ) {
        return null;
      }

      Group group = (Group) groupDAO.find(groupId);
      groupId = ( group != null && ! SafetyUtil.isEmpty(group.getParent()) ) ? group.getParent() : "*";
    } while ( ! SafetyUtil.isEmpty(groupId) );

    return null;
  }

  protected String groupId_;

  public DAOResourceLoader(X x, String groupId) {
    setX(x);
    this.groupId_ = groupId;
  }

  @Override
  public Optional<Charset> getCharset(String s) {
    return Optional.absent();
  }

  @Override
  public InputStream load(String s) {
    EmailTemplate template = DAOResourceLoader.findTemplate(getX(), s, this.groupId_);
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
