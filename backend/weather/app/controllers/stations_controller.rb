class StationsController < ApplicationController
  def query_station
    latlong = JSON.parse(Base64.urlsafe_decode64(params[:latlong]))
    render json: Station.closest_station(latlong["latitude"], latlong["longitude"])
  end

  def query_weather
    noaa_id_year = JSON.parse(Base64.urlsafe_decode64(params[:noaa_id_year]))
    station = Station.find_by(noaa_id: noaa_id_year["noaa_id"])
    render json: station.get_data(noaa_id_year["year"])
  end
end
