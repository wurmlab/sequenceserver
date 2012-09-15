require 'minitest/spec'
require 'minitest/autorun'

module SequenceServer

  module JSHint

    class << self

      def  run
        files.each do |file|
          describe "#{file}" do
            before do
              assert JSHint.installed?, "JSHint not installed."
            end

            it 'should pass jshint rules' do
              assert JSHint.pass?(file), "#{file} fails jshint rules."
            end
          end
        end
      end

      def add(file)
        files << File.expand_path(file, js_dir)
      end

      def files
        @files ||= []
      end

      def installed?
        !jshint.empty?
      end

      def pass?(file)
        system "#{jshint} --config #{jshintrc} #{file}"
      end

      private

      def js_dir
        @js_dir ||= File.join(root, 'public', 'js')
      end

      def jshintrc
        @jshintrc ||= File.join(root, '.jshintrc')
      end

      def jshint
        @jshint ||= `which jshint`.chomp
      end

      def root
        @root ||= File.expand_path(File.dirname(File.dirname(__FILE__)))
      end
    end
  end
end

SequenceServer::JSHint.add 'sequenceserver.js'
SequenceServer::JSHint.add 'sequenceserver.blast.js'
SequenceServer::JSHint.add 'jquery.index.js'
SequenceServer::JSHint.add 'jquery.scrollspy.js'

SequenceServer::JSHint.run
