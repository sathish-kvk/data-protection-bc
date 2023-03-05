#!/bin/bash -e
# WARNING: FOR PIPELINE USE UNLESS YOU WANT TO INSTALL GO
echo "For pipeline use!"

export PATH=$PATH:$PWD/goinstall/go/bin
export GOPATH=$PWD/goinstall/workspace
export PATH=$PATH:$GOPATH/bin

PLUGINDIR=$GOPATH/src/removeSpace
mkdir -p $PLUGINDIR

cp -r devops/removeParty/removeSpace/* $PLUGINDIR/

pushd $PLUGINDIR
go get
go install

popd
