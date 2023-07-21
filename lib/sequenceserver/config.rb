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

      @config_file = @data.delete(:config_file)
      if @config_file
        @config_file = File.expand_path(@config_file)
        @data = parse_config_file.deep_merge @data
      end

      @data = defaults.deep_merge @data

      return unless @upgraded

      logger.info 'You are using old configuration syntax. ' \
                  'Run `sequenceserver -s` to update your config file syntax.'
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

    # Symbolizes keys. Rename/reformat key-values.
    def normalize(data)
      return {} unless data

      # Symbolize keys.
      data = data.transform_keys(&:to_sym)

      # Very old config files may have a key called `database`.
      # Rename it to `database_dir`
      if data[:database]
        database_dir = data.delete(:database)
        data[:database_dir] ||= database_dir
        @upgrade = true
      end

      # Old config files may have an options hash with array values. We turn the
      # array values into a hash. The logic is simple: If the array value is the
      # same as default, we give it the key 'default', otherwise we give it the
      # key 'custom'
      data[:options]&.each do |key, val|
        next if val.is_a? Hash

        data[:options][key] = if val == defaults[:options][key][:default]
                                { default: val }
                              else
                                { custom: val }
                              end
        @upgraded = true
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
      logger.info "Reading configuration file: #{config_file}."
      normalize YAML.load_file(config_file)
    rescue StandardError => e
      raise CONFIG_FILE_ERROR.new(config_file, e)
    end

    def file?(file)
      file && File.exist?(file) && File.file?(file)
    end

    # Default configuration data.
    def defaults
      @defaults ||= {
        host: '0.0.0.0',
        port: 4567,
        databases_widget: 'classic',
        options: {
          blastn: {
            default: ['-task blastn', '-evalue 1e-5']
          },
          blastp: {
            default: ['-evalue 1e-5']
          },
          blastx: {
            default: ['-evalue 1e-5']
          },
          tblastx: {
            default: ['-evalue 1e-5']
          },
          tblastn: {
            default: ['-evalue 1e-5']
          }
        },
        num_threads: 1,
        num_jobs: 1,
        job_lifetime: 43_200,
        # Set cloud_share_url to 'disabled' to disable the cloud sharing feature
        cloud_share_url: 'https://share.sequenceserver.com/api/v1/shared-job'
      }
    end
  end
end
