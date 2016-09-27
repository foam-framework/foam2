#!/bin/sh
#
# Checks out reference revision for regression benchmarks, 
# runs for reference and current revision, compares the 
# output.

rm -rf tmp/regressionBenchmark
mkdir tmp
mkdir tmp/regressionBenchmark
cd tmp/regressionBenchmark

# reference revision
git clone ../.. . --no-checkout
git checkout 501fde8b685eefa8f90940af2a1870401f9a653a
ln -s ../../node_modules

npm run benchmark-regression > ../../bench-regression-reference.log

rm node_modules
cd ../..

npm run benchmark-regression > bench-regression-current.log

npm run benchmark-reg-check