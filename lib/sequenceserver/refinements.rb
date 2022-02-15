class Hash
  def deep_copy
    Marshal.load Marshal.dump self
  end
end