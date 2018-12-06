package foam.nanos.auth;

import foam.core.ContextAwareSupport;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.NanoService;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Query the region by code, name, or alternative names.
 */
public class RegionService extends ContextAwareSupport implements NanoService {

  protected DAO regionDAO;
  protected EmailService emailService;

  @Override
  public void start() throws Exception {
    regionDAO    = (DAO) getX().get("regionDAO");
    emailService = (EmailService) getX().get("email");
  }

  public Region getRegion(String query) {
    Region region = null;

    // 1. by code
    region = (Region) regionDAO.find(query.toUpperCase());
    if ( region != null ) return region;

    query = formatName(query);

    // 2. by name
    region  = findRegion(MLang.EQ(Region.NAME, query));
    if ( region != null ) return region;

    // 3. by alternative names
    region = findRegion(MLang.IN(query, Region.ALTERNATIVE_NAMES));

    if ( region == null ) {
      notifySupport(query);
    }

    return region;
  }

  protected Region findRegion(Predicate mLang) {
    Region region = null;

    ArraySink select  =
      (ArraySink) regionDAO.where(mLang).select(new ArraySink());
    if ( select.getArray().size() != 0 ) {
      region = (Region) select.getArray().get(0);
    }

    return region;
  }

  protected void notifySupport(String query) {
    EmailMessage emailMessage = new EmailMessage();
    emailMessage.setSubject ("Unknown Region");
    emailMessage.setBody    ("User just added an unknown region " + query);
    emailMessage.setTo(new String[]{"ops@nanopay.net"});
    emailService.sendEmail(getX(), emailMessage);
  }

  protected String formatName(String query) {
    return Arrays.stream(query.split(" "))
      .map(string -> string.equals("and") || string.equals("of") ?
        string :
        string.substring(0, 1).toUpperCase() + string.substring(1).toLowerCase())
      .collect(Collectors.joining(" "));
  }

}
