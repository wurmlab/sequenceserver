require 'yaml'
require 'forwardable'

# Define Config class.
module SequenceServer
  # Capture our configuration system.
  class Config
    extend Forwardable

    def_delegators SequenceServer, :logger

    def initialize(data = {})
      @data = normalize data
      @config_file = @data.delete(:config_file) || default_config_file
      @config_file = File.expand_path(@config_file)
      @data = parse_config_file.update @data
      @data = defaults.update @data
    end

    attr_reader :data, :config_file

    # Get.
    def [](key)
      data[key]
    end

    # Set.
    def []=(key, value)
      data[key] = value
    end

    # Exists?
    def include?(key)
      data.include? key
    end

    # Write config data to config file.
    def write_config_file
      return unless config_file
      File.open(config_file, 'w') do |f|
        f.puts(data.delete_if { |_, v| v.nil? }.to_yaml)
      end
    end

    private

    # Symbolizes keys. Changes `database` key to `database_dir`.
    def normalize(data)
      return {} unless data

      # Symbolize keys.
      data = Hash[data.map { |k, v| [k.to_sym, v] }]

      # The newer config file version replaces the older database key with
      # database_dir for correctness. Let's honour the old version as well.
      if data[:database]
        database_dir = data.delete(:database)
        data[:database_dir] ||= database_dir
      end

      data
    end

    # Parses and returns data from config_file if it exists. Returns {}
    # otherwise.
    def parse_config_file
      unless file? config_file
        logger.debug "Configuration file not found: #{config_file}"
        return {}
      end

      logger.debug "Reading configuration file: #{config_file}."
      normalize YAML.load_file(config_file)
    rescue => error
      raise CONFIG_FILE_ERROR.new(config_file, error)
    end

    def file?(file)
      file && File.exist?(file) && File.file?(file)
    end

    # Default configuration data.
    def defaults
      {
        :num_threads  => 1,
        :port         => 4567,
        :host         => '0.0.0.0'
      }
    end

    def default_config_file
      '~/.sequenceserver.conf'
    end
  end
end
