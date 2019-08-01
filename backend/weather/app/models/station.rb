# frozen_string_literal: true

def sensible_year(year)
    # 81 years of forward compatibility
  if year > 2100
    return false
  elsif year < 0
    return false
  end
  return true
end

def sensible_month?(month)
  if month > 12
    return false
  elsif month < 0
    return false
  end
  return true
end

def haversine_distance_module(lat1, lon1, lat2, lon2)
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

def parse_monthly_results(results, weather_results_for_year)
  weather_results_for_year.each do |datum|
    index = Date.parse(datum["date"].split("T")[0]).month - 1
    case datum["datatype"]
    when "MNTM"
      results[index]["mean_temp"] = datum["value"]
    when "TPCP"
      results[index]["total_precip"] = datum["value"]
    when "TSNW"
      results[index]["total_snow"] = datum["value"]
    end
  end
end

def parse_daily_results(results, weather_results_for_month)
  weather_results_for_month["results"].each do |datum|
    index = Date.parse(datum["date"].split("T")[0]).day - 1
    case datum["datatype"]
    when "TMAX"
      results[index]["max_temp"] = datum["value"]
    when "TMIN"
      results[index]["min_temp"] = datum["value"]
    end
  end
end


class Station < ApplicationRecord
  # include StationHelper
  Dotenv.load("api_key.env")
  @@api_key = ENV["API_KEY"]

  def self.closest_station(latitude, longitude)
    Station.all.min_by do |station|
      haversine_distance_module(latitude, longitude, station.latitude, station.longitude)
    end
  end

  def build_monthly_query_url(year)
    "https://www.ncdc.noaa.gov/cdo-web/api/v2/data/?datasetid=GHCNDMS&stationid=#{noaa_id}&startdate=#{year}-01-01&enddate=#{year}-12-31&datatypeid=MNTM&datatypeid=TSNW&datatypeid=TPCP&units=standard&limit=36"
  end

  # temporary so I don't have to fix the tests right now
  def self.haversine_distance(lat1, lon1, lat2, lon2)
    # byebug
    haversine_distance_module(lat1, lon1, lat2, lon2)
  end


  def build_base_monthly_hash
    months = [
      { month: "January" },
      { month: "February" },
      { month: "March" },
      { month: "April" },
      { month: "May" },
      { month: "June" },
      { month: "July" },
      { month: "August" },
      { month: "September" },
      { month: "October" },
      { month: "November" },
      { month: "December" }
    ]
    months
  end

  def build_return_hash_monthly(year, results, errors)
    {
      "meta" => {
        "year" => year,
        "noaa_id" => noaa_id,
        "city" => city,
        "state" => state
      },
      "results" => results,
      "errors" => errors
    }
  end


  def get_monthly_weather(year)
    errors = []
    if !sensible_year(year)
      errors << "Invalid year `#{year}`."
    end
    url = build_monthly_query_url(year)
    resp = RestClient::Request.execute(url: url, method: "GET", headers: { token: @@api_key })
    results = build_base_monthly_hash
    parsed = JSON.parse(resp)
    weather_results_for_year = parsed["results"]
    parse_monthly_results(results, weather_results_for_year)

    build_return_hash_monthly(year, results, errors)
  end

  def get_daily_weather(year, month)
    errors = []
    if !sensible_year(year)
      errors << "Invalid year `#{year}`."
    end

    if !sensible_month?(month)
      errors << "Invalid month `#{month}`"
    end

    start_date = Date.civil(year, month, 1)
    end_date = Date.civil(year, month, -1)

    url = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data/?datasetid=GHCND&stationid=#{noaa_id}&startdate=#{start_date.to_s}&enddate=#{end_date.to_s}&datatypeid=TMAX&datatypeid=TMIN&units=standard&limit=62"

    resp = RestClient::Request.execute(url: url, method: "GET", headers: { token: @@api_key })
    weather_results_for_month = JSON.parse(resp)
    if weather_results_for_month.empty?

    end

    hash_iterator = start_date..end_date
    results = hash_iterator.map do |date|
      { day: date.day }
    end
    parse_daily_results(results, weather_results_for_month)
    {
      "meta" => {
        "year" => year,
        "month" => month,
        "noaa_id" => noaa_id,
        "city" => city,
        "state" => state
      },
      "results" => results,
      "errors" => errors
    }
  end
end
