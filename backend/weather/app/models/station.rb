# frozen_string_literal: true

MONTHS = [
  { month: 'January' },
  { month: 'February' },
  { month: 'March' },
  { month: 'April' },
  { month: 'May' },
  { month: 'June' },
  { month: 'July' },
  { month: 'August' },
  { month: 'September' },
  { month: 'October' },
  { month: 'November' },
  { month: 'December' }
]

class Station < ApplicationRecord
  Dotenv.load('api_key.env')
  @@api_key = ENV['API_KEY']
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

  def build_query_url(year)
    "https://www.ncdc.noaa.gov/cdo-web/api/v2/data/?datasetid=GHCNDMS&stationid=#{noaa_id}&startdate=#{year}-01-01&enddate=#{year + 1}-01-01&datatypeid=MNTM&datatypeid=TSNW&datatypeid=TPCP&units=standard&limit=36"
  end

  def build_base_weather_array
    MONTHS
  end

  def get_weather(year)
    url = build_query_url(year)
    resp = RestClient::Request.execute(url: url, method: 'GET', headers: { token: @@api_key })

    results = build_base_weather_array
    weather_results_for_year = JSON.parse(resp)['results']
    weather_results_for_year.each do |datum|
      index = Date.parse(datum['date'].split('T')[0]).month - 1
      case datum['datatype']
      when 'MNTM'
        results[index]['mean_temp'] = datum['value']
      when 'TPCP'
        results[index]['total_precip'] = datum['value']
      when 'TSNW'
        results[index]['total_snow'] = datum['value']
      end
    end
    {
      'meta' => {
        'year' => year,
        'noaa_id' => noaa_id,
        'city' => city,
        'state' => state
      },
      'results' => results
    }
  end
end
