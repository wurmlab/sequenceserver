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

      logger.warn 'You are using old configuration syntax. ' \
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

      data[:options] = convert_deprecated_options(data[:options]) if data[:options]

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
            default: {
              description: nil,
              attributes: ['-task blastn', '-evalue 1e-5']
            }
          },
          blastp: {
            default: {
              description: nil,
              attributes: ['-evalue 1e-5']
            }
          },
          blastx: {
            default: {
              description: nil,
              attributes: ['-evalue 1e-5']
            }
          },
          tblastx: {
            default: {
              description: nil,
              attributes: ['-evalue 1e-5']
            }
          },
          tblastn: {
            default: {
              description: nil,
              attributes: ['-evalue 1e-5']
            }
          }
        },
        num_threads: 1,
        num_jobs: 1,
        job_lifetime: 43_200,
        # Set cloud_share_url to 'disabled' to disable the cloud sharing feature
        cloud_share_url: 'https://share.sequenceserver.com/api/v1/shared-job',
        # Warn in the UI before rendering results larger than this value
        large_result_warning_threshold: 250 * 1024 * 1024,
        optimistic: false # Faster, but does not perform DB compatibility checks
      }
    end

    def convert_deprecated_options(options)
      options.each do |blast_algo, algo_config|
        if algo_config.is_a?(Array)
          # Very old config files may have a single array with CLI args.
          # e.g. { blastn: ['-task blastn', '-evalue 1e-5'] }
          # Convert the array values into a single hash naming it 'default' if
          # the values match SequenceServer defaults.
          options[blast_algo] = if algo_config == defaults.dig(:options, blast_algo, :default, :attributes)
                                  { default: { attributes: algo_config } }
                                else
                                  { custom: { attributes: algo_config } }
                                end
          @upgraded = true
        elsif algo_config.is_a?(Hash)
          # v3.0.1 and older config files contain a flatter structure
          # with an array instead of 'description' and 'attributes' keys.
          # e.g. { blastn: { default: ['-task blastn', '-evalue 1e-5'] }
          algo_config.each do |config_name, config|
            next unless config.is_a?(Array)

            options[blast_algo][config_name] = {
              description: nil,
              attributes: config
            }
            @upgraded = true
          end
        end
      end

      options
    end
  end
end
