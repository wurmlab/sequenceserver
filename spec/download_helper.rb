# Based on https://stackoverflow.com/a/29544674
module DownloadHelpers
  def downloads_dir
    File.join(__dir__, 'downloads')
  end

  def wait_for_download
    sleep 1
    Timeout.timeout(Capybara.default_max_wait_time) do
      sleep 1 until downloaded?
    end
  end

  def downloaded_file
    downloads.first
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
