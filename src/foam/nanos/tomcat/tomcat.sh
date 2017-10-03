/$CATALINA_HOME/bin/shutdown.sh
#rm -rf ../../../../build/
cd ../../../
./gen.sh
cd ../build/
mvn clean package
cd target
mv foam-1.0-SNAPSHOT.war ROOT.war
cp ROOT.war $CATALINA_HOME/webapps/



#cd ../../src/
#cp foam.js $CATALINA_HOME/bin/foam2/
#cp foam/nanos/nanos.js $CATALINA_HOME/bin/foam2/
#cp foam/u2/ListCreateController.js $CATALINA_HOME/bin/foam2/
#cp -r ../../NANOPAY/retail/ $CATALINA_HOME/bin/foam2/

cd $CATALINA_HOME/bin/
./startup.sh
