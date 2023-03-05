#!/bin/bash -e
# WARNING: FOR PIPELINE USE UNLESS YOU WANT TO INSTALL GO
echo "For pipeline use!"

#copy latest my sql scripts
cp -Rf database/mysql/. devops/onboardParty/dbsetup/mysql/

export PATH=$PATH:$PWD/goinstall/go/bin
export GOPATH=$PWD/goinstall/workspace
export PATH=$PATH:$GOPATH/bin

PLUGINDIR=$GOPATH/src/deploySpace
mkdir -p $PLUGINDIR

mv devops/onboardParty/deploySpace/* $PLUGINDIR

pushd $PLUGINDIR
#go version
go get
go install

popd
#Build deployLoopback 
LOOPBACKDIR=$GOPATH/src/deployLoopback
mkdir -p $LOOPBACKDIR

mv devops/onboardParty/deployLoopback/* $LOOPBACKDIR

pushd $LOOPBACKDIR
go get
go install

popd
#Build cleanupSpace 
CLEANUPDIR=$GOPATH/src/cleanupSpace
mkdir -p $CLEANUPDIR

mv devops/onboardParty/cleanupSpace/* $CLEANUPDIR

pushd $CLEANUPDIR
go get
go install

popd

#Build publishPartyAPI 
PUBLISHPARTYAPIDIR=$GOPATH/src/publishPartyAPI
mkdir -p $PUBLISHPARTYAPIDIR

cp -r devops/onboardParty/publishPartyAPI/* $PUBLISHPARTYAPIDIR

pushd $PUBLISHPARTYAPIDIR
go get
go install

popd
