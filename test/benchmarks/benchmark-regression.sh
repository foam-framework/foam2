#!/bin/sh
#
# Checks out reference revision for regression benchmarks, 
# runs for reference and current revision, compares the 
# output.

mkdir tmp
mkdir tmp/regressionBenchmark
cd tmp/regressionBenchmark

# reference revision
git clone ../.. . --no-checkout
git checkout ae46ebd9ffb0fb6f0d22d86abfc96b927b7161a8
ln -s ../../node_modules

npm run benchmark-regression > ../../bench-regression-reference.log

rm node_modules
cd ../..

npm run benchmark-regression > bench-regression-current.log

echo "BENCH_A = {" `cat bench-regression-reference.log` "}; BENCH_B = {" `cat bench-regression-current.log` "}" `cat test/benchmarks/regressionCheck.js` > benchmark_regression_test.js
npm run benchmark-regression-check