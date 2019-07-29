class Station < ApplicationRecord
  def self.haversine_distance(lat1, lon1, lat2, lon2)
    # Get latitude and longitude

    # Calculate radial arcs for latitude and longitude
    dLat = (lat2 - lat1) * Math::PI / 180
    dLon = (lon2 - lon1) * Math::PI / 180

    a = Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
        Math.cos(lat1 * Math::PI / 180) *
        Math.cos(lat2 * Math::PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)

    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    c
  end

  def self.closest_station(latitude, longitude)
    Station.all.min_by do |station|
      Station.haversine_distance(latitude, longitude, station.latitude, station.longitude)
    end
  end

  def get_data
    noaa_id
  end
end
