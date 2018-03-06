require 'spec_helper'
require 'sequenceserver/config'

# Test Config class.
module SequenceServer
  describe 'Config' do
    let 'sample_config_file' do
      File.join(SequenceServer.root, 'spec', 'sample.conf')
    end

    it 'behaves like a Hash' do
      config = Config.new

      config.should respond_to :[]
      config.should respond_to :[]=
      config.should respond_to :include?

      config[:key] = 'value'
      config[:key].should eq 'value'
      config.include?(:key).should be_truthy
    end

    it 'has reasonable defaults' do
      config = Config.new
      config[:num_threads].should eq 1
      config[:host].should eq '0.0.0.0'
      config[:port].should eq 4567
    end

    it 'symbolizes keys' do
      config = Config.new('key' => 'value')
      config.include?('key').should be_falsey
      config.include?(:key).should be_truthy
      config[:key].should eq 'value'

      config = Config.new(:config_file => sample_config_file)
      config.include?('num_threads').should be_falsey
      config.include?(:num_threads).should be_truthy
    end

    it 'changes database key, if present, to database_dir' do
      # Does so for data Hash passed to Config.new.
      config = Config.new(:database => 'database_dir')
      config.include?(:database).should be_falsey
      config[:database_dir].should eq 'database_dir'

      # Does so for data parsed from config_file.
      config = Config.new(:config_file => sample_config_file)
      config.include?(:database).should be_falsey
      config[:database_dir].should eq 'database_dir'

      # If both database and database_dir key are present, database key is
      # removed and database_dir key takes preecedence.
      config = Config.new(:database     => 'database',
                          :database_dir => 'database_dir')
      config.include?(:database).should be_falsey
      config[:database_dir].should eq 'database_dir'
    end

    it 'parses config_file and merges with defaults, values from config_file' \
       'taking preecedence' do
      config = Config.new(:config_file => sample_config_file)

      # config_file key becomes config.config_file
      config.include?(:config_file).should be_falsey
      config.config_file.should eq sample_config_file

      # First check that a default value is present. Then check that a value
      # from config file is present.
      #
      # We use num_threads key from config_file to test. The default value of
      # num_threads is 1, but is set to 10 in config_file. If the final value
      # is 10, we have ensured that config_file takes preecedence over
      # default values.
      config[:port].should eq 4567
      config[:num_threads].should eq 10
    end

    it 'merges arguments with defaults and values from config_file,' \
       'arguments taking precedence' do
      config = Config.new(:config_file => sample_config_file,
                          :num_threads => 20, :job_lifetime => "INF")
      config[:num_threads].should eq 20
      config[:job_lifetime].should eq "INF"
    end
  end
end
