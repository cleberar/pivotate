File.open('image.jpg', 'wb') do |file|
  file << (IO.readlines('image.txt').to_s.unpack('m')).first
end
