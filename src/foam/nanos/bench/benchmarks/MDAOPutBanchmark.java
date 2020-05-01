package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.nanos.auth.Country;
import foam.nanos.bench.Benchmark;

import java.util.HashSet;
import java.util.Map;
import java.util.Random;
import java.util.Set;

public class MDAOPutBanchmark implements Benchmark {

  protected DAO dao_;
  protected Country[] countries;
  protected Country a1_;
  protected int i = 0;
  private char[] alphabet = {'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'};


  @Override
  public void setup(X x) {
    dao_ = new MDAO(Country.getOwnClassInfo());
    ((MDAO) dao_).addIndex(new foam.core.PropertyInfo[] {Country.NAME});
    ((MDAO) dao_).addIndex(new foam.core.PropertyInfo[] {Country.CODE});

    countries = new Country[1000];

    Set<String> ids = new HashSet<>();
    Set<String> names = new HashSet<>();
    Set<String> codes = new HashSet<>();

    Random rand = new Random();


    Country newCountry = null;
    StringBuffer sb;
    int i = 0;
    while ( ids.size() < 1000999 ) {
      int randomLength = 8;
      int j = 0;
      String s = "";
      sb = new StringBuffer();
      while ( j < randomLength ) {
        sb.append(alphabet[rand.nextInt(alphabet.length)]);
        j++;
      }
      s = sb.toString();
      if ( ! ids.contains(s) ) {
        ids.add(s);

        newCountry = new Country.Builder(x).setId(s).setCode(s).setName(s).build();
        if ( names.size() < 256 ) {
          names.add(s);
        }
        if ( codes.size() < 256 ) {
          codes.add(s);
        }
        newCountry.setName(names.toArray()[rand.nextInt(names.size())].toString());
        newCountry.setCode(codes.toArray()[rand.nextInt(codes.size())].toString());

        if ( ids.size() <= 1000000 )
          dao_.put_(x, newCountry);
        else {
          countries[i] = newCountry;
          i++;
        }
      }
    }
    countries[i] = new Country.Builder(x).setId("AA").setCode("AA").setName("AA").build();
  }

  @Override
  public void teardown(X x, Map stats) {
  }

  @Override
  public void execute(X x) {
    dao_.put_(x, countries[i]);
    i++;
  }
}
