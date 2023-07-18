# Based on https://stackoverflow.com/a/29544674
module DownloadHelpers
  DOWNLOADS_DIR = File.join(__dir__, 'downloads')

  def downloads_dir
    DOWNLOADS_DIR
  end

  def wait_for_download
    Timeout.timeout(Capybara.default_max_wait_time) do
      loop do
        sleep 1
        break if downloaded?
      end
    end
  end

  def downloaded_file
    warn '*** Multiple files in downloads directory. Expected one. ***' if downloads.length > 1
    downloads.sort_by { |f| File.mtime(f) }.last
  end

  def clear_downloads
    FileUtils.rm(downloads)
  end

  def downloaded?
    !downloading? && downloads.any?
  end

  def downloading?
    downloads.grep(/\.part$/).any?
  end

  def downloads
    Dir[File.join(downloads_dir, '*')]
  end
end
