package foam.nanos.auth;

import foam.core.ContextAwareSupport;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.NanoService;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Query the country and region by code, name, or alternative names.
 */
public class CountryAndRegionCacheService extends ContextAwareSupport implements NanoService {

  private DAO countryDAO;
  private DAO regionDAO;
  private EmailService emailService;
  private Map<String, Country> countryCache;
  private Map<String, Region>  regionCache;

  @Override
  public void start() throws Exception {
    countryDAO   = (DAO) getX().get("countryDAO");
    regionDAO    = (DAO) getX().get("regionDAO");
    emailService = (EmailService) getX().get("email");
    countryCache = new ConcurrentHashMap<>();
    regionCache  = new ConcurrentHashMap<>();
  }

  public Country getCountry(String query) {
    Country country = null;

    // 1. by 2 digit iso code
    if ( query.length() == 2) {
      return (Country) countryDAO.find(query.toUpperCase());
    }

    // 2. by 3 digit iso code
    if ( query.length() == 3) {
      return findCountry(MLang.EQ(Country.ISOCODE, query.toUpperCase()));
    }

    query = formatName(query);

    // 3. by name
    country = findCountry(MLang.EQ(Country.NAME, query));
    if ( country != null ) return country;

    // 4. from cache
    country = countryCache.get(query);
    if ( country != null ) return country;

    // 5. by alternative name
    country = findCountryFromAlternativeName(query);
    if ( country != null ) {
      countryCache.put(query, country);
    } else {
      notifySupport("country " + query);
    }

    return country;
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

    // 3. from cache
    region = regionCache.get(query);
    if ( region != null ) return region;

    // 4. from alternative name
    region = findRegionFromAlternativeName(query);
    if ( region != null ) {
      regionCache.put(query, region);
    } else {
      notifySupport("region " + query);
    }

    return region;
  }

  private Country findCountryFromAlternativeName(String countryName) {

    ArraySink sink = (ArraySink) countryDAO.select(new ArraySink());
    ArrayList<Country> countries = (ArrayList<Country>) sink.getArray();

    Optional<Country> country = countries.parallelStream()
      .filter(temp -> Arrays.asList(temp.getAlternativeName()).contains(countryName))
      .findFirst();

    return country.isPresent() ? country.get() : null;
  }

  private Country findCountry(Predicate mLang) {
    Country country = null;

    ArraySink select =
      (ArraySink) countryDAO.where(mLang).select(new ArraySink());
    if ( select.getArray().size() != 0 ) {
      country = (Country) select.getArray().get(0);
    }

    return country;
  }

  private Region findRegionFromAlternativeName(String regionName) {

    ArraySink sink = (ArraySink) regionDAO.select(new ArraySink());
    ArrayList<Region> regions = (ArrayList<Region>) sink.getArray();

    Optional<Region> region = regions.parallelStream()
      .filter(temp -> Arrays.asList(temp.getAlternativeName()).contains(regionName))
      .findFirst();

    return region.isPresent() ? region.get() : null;
  }

  private Region findRegion(Predicate mLang) {
    Region region = null;

    ArraySink select  =
      (ArraySink) regionDAO.where(mLang).select(new ArraySink());
    if ( select.getArray().size() != 0 ) {
      region = (Region) select.getArray().get(0);
    }

    return region;
  }

  private void notifySupport(String query) {
    EmailMessage emailMessage = new EmailMessage();
    emailMessage.setSubject ("Unknown Country or Region");
    emailMessage.setBody    ("User just added an unknown " + query);
    emailMessage.setTo(new String[]{"ops@nanopay.net"});
    emailService.sendEmail(getX(), emailMessage);
  }

  private String formatName(String query) {
    return Arrays.stream(query.split(" "))
      .map(string -> string.substring(0, 1).toUpperCase() + string.substring(1).toLowerCase())
      .collect(Collectors.joining(" "));
  }

}
