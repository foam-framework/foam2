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

public class MDAOUpdateFind implements Benchmark {

  protected DAO dao_;
  protected Country[] countries;
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

    Country newCountry;
    StringBuffer sb;
    int i = 0;
    while ( ids.size() < 1001000 ) {
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

        dao_.put_(x, newCountry);
        if ( i < 1000 ) {
          if ( i != 0 ) {
            int randValue;
            while ( true ) {
              randValue = rand.nextInt(names.size());
              if ( ! newCountry.getName().equals(names.toArray()[randValue]) )
                break;
            }
            newCountry.setName(names.toArray()[randValue].toString());

            while ( true ) {
              randValue = rand.nextInt(codes.size());
              if ( ! newCountry.getCode().equals(codes.toArray()[randValue]) )
                break;
            }
            newCountry.setCode(codes.toArray()[randValue].toString());
          }
          countries[i] = newCountry;
          i++;
        }
      }
    }
  }

  @Override
  public void teardown(X x, Map stats) {
  }

  @Override
  public void execute(X x) {
    dao_.put_(x, countries[i]);
    Country c = (Country)dao_.find(countries[i].getId());
    i++;
  }
}
