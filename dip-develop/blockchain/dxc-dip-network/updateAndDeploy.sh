#!/bin/bash

#build
composer archive create --sourceType dir --sourceName . -a dxc-dip-network@0.0.1.bna

#Run the following command to update the business network
composer network update -a dxc-dip-network@0.0.1.bna -c admin@dxc-dip-network

#test
composer network ping -c admin@dxc-dip-network

#Start composer REST server
composer-rest-server -c admin@dxc-dip-network -n never
