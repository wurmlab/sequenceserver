require 'rubygems'
require 'bundler/setup'

ENV['RACK_ENV'] ||= 'production'

require 'sequenceserver'
run SequenceServer.init
