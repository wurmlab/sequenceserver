# ensure 'lib/' is in the load path
require File.join(File.dirname(__FILE__), 'lib', 'sequenceserver')

SequenceServer::App.init
run SequenceServer::App
