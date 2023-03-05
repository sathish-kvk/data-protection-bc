#!/bin/bash

#Generate bna
composer archive create -t dir -n .

#install the composer runtime
composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName dxc-dip-network

#deploy the business network
composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile dxc-dip-network@0.0.1.bna --file networkadmin.card

#To import the network administrator identity as a usable business network card
composer card import --file networkadmin.card

#To check that the business network has been deployed successfully
composer network ping --card admin@dxc-dip-network

#Start composer REST server
composer-rest-server -c admin@dxc-dip-network -n never
