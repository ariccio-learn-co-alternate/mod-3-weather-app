class StationsController < ApplicationController
  def query_station
    latlong = JSON.parse(Base64.urlsafe_decode64(params[:latlong]))
    render json: Station.closest_station(latlong["latitude"], latlong["longitude"])
  end

  def query_weather
    station = Station.find_by(noaa_id: params[:noaa_id])
    render json: station.get_data(params[:year])
  end
end
