require 'rubygems'

ENV['RACK_ENV'] ||= 'production'

require 'sequenceserver'
run SequenceServer.init
