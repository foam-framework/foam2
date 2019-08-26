package foam.nanos.auth;

import foam.core.ContextAwareSupport;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.NanoService;
import foam.nanos.notification.email.EmailMessage;
import foam.util.Emails.EmailsUtility;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Query the country by code, name, or alternative names.
 */
public class CountryService extends ContextAwareSupport implements NanoService {

  protected DAO countryDAO;

  @Override
  public void start() throws Exception {
    countryDAO   = (DAO) getX().get("countryDAO");
  }

  public Country getCountry(String query) {
    Country country = null;

    // 1. by 2 digit iso code
    if ( query.length() == 2) {
      return (Country) countryDAO.find(query.toUpperCase());
    }

    // 2. by 3 digit iso code
    if ( query.length() == 3) {
      return findCountry(MLang.EQ(Country.ISO31661CODE, query.toUpperCase()));
    }

    query = formatName(query);

    // 3. by name
    country = findCountry(MLang.EQ(Country.NAME, query));
    if ( country != null ) return country;

    // 4. by alternative names
    country = findCountry(MLang.IN(query, Country.ALTERNATIVE_NAMES));

    return country;
  }

  protected Country findCountry(Predicate mLang) {
    Country country = null;

    ArraySink select =
      (ArraySink) countryDAO.where(mLang).select(new ArraySink());
    if ( select.getArray().size() != 0 ) {
      country = (Country) select.getArray().get(0);
    }

    return country;
  }

  protected String formatName(String query) {
    return Arrays.stream(query.split(" "))
      .map(string -> string.equals("and") || string.equals("of") ?
          string :
          string.substring(0, 1).toUpperCase() + string.substring(1).toLowerCase())
      .collect(Collectors.joining(" "));
  }

}
