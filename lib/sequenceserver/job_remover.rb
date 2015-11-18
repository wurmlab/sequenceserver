require 'sequenceserver/job.rb'

module SequenceServer 
  class JobRemover

    DEFAULT_LIFETIME = 86400

    def initialize(lifetime)
      parse lifetime
      spawn_cleanup if @clean_needed
    end

    extend Forwardable
    def_delegators SequenceServer, :logger

    def spawn_cleanup

      Thread.new do 
        loop do
          begin
            #leave incomplete jobs
            finished_jobs = Job.all.select{ |f| f.done? }
            now = Time.now

            unless finished_jobs.empty?
              exp_jobs = finished_jobs.select do |job|
                (job.completed_at + @lifetime) < now
              end

              exp_jobs.each{ |job| Job.delete job.id }
            end

            remaining_jobs = (exp_jobs.nil?) ? finished_jobs : finished_jobs - exp_jobs
            oldest_time = remaining_jobs.map(&:completed_at).min

            @next_cleanup = @lifetime
            if  !!oldest_time && now < (oldest_time + @lifetime)
              @next_cleanup = (oldest_time + @lifetime) - now
            end

            sleep(@next_cleanup.to_i)
          rescue => e #StandardError
            logger.debug("Cleanup thread shutting down due to Error:")
            logger.debug(e.inspect)
            logger.debug(e.backtrace.join("\n"))

            Thread.exit
          end
        end
      end
    end

    def parse(job_lifetime)
      @clean_needed = true
      if job_lifetime.nil?
        @lifetime = DEFAULT_LIFETIME
      elsif job_lifetime == "INF"
        @clean_needed = false
      else
        @lifetime = job_lifetime.to_i * 60
      end
    end

  end
end
