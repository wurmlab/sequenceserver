require 'sequenceserver/job'

module SequenceServer

  # Removes expired jobs in a background thread.
  #
  # Job lifetime is provided in minutes. It can be zero in which case jobs will
  # be deleted as soon as they are done, or it can be Infinity in which case
  # jobs will never be deleted. Default is to delete finished jobs after 7 days.
  class JobRemover
    DEFAULT_JOB_LIFETIME = 43200 # minutes (i.e., 30 days)

    def initialize(job_lifetime)
      @job_lifetime = job_lifetime || DEFAULT_JOB_LIFETIME
      return if @job_lifetime == Float::INFINITY
      @job_lifetime = Integer(@job_lifetime) * 60
      spawn_cleanup
    end

    extend Forwardable
    def_delegators SequenceServer, :logger

    private

    def spawn_cleanup
      Thread.new do
        loop do
          begin
            now = Time.now
            finished_jobs = Job.all.select { |f| f.done? }

            # Cleanup finished jobs that have lived a lifetime.
            expired_jobs = finished_jobs.select do |job|
              (job.completed_at + @job_lifetime) <= now
            end
            expired_jobs.each { |job| Job.delete job.id }
            unless expired_jobs.empty?
              logger.info "#{logid}: deleted #{expired_jobs.count} old jobs."
            end

            # Decide when to cleanup next.
            remaining_jobs = finished_jobs - expired_jobs
            oldest_time = remaining_jobs.map(&:completed_at).min
            if oldest_time && now < (oldest_time + @job_lifetime)
              @next_cleanup = (oldest_time + @job_lifetime) - now
            else
              @next_cleanup = @job_lifetime
            end

            # Sleep till next cleanup.
            sleep @next_cleanup.ceil
          rescue => e
            logger.fatal("#{logid}: #{e.inspect}\n#{e.backtrace.join("\n")}")
            Thread.exit
          end
        end
      end
    end

    # Identifier for logs emitted by JobRemover.
    def logid
      @logid ||= self.class.name.split('::').last
    end
  end
end
