#!/bin/bash
export PATH=/opt/IBM/node-v6.7.0/bin:$PATH
npm install -g mocha
npm install -g mocha-simple-html-reporter

#Run test
mocha innovator/NameCheckers/test --recursive --reporter mocha-simple-html-reporter --reporter-options output=test-report.html