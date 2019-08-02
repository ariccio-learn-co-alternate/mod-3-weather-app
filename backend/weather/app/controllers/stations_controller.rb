class StationsController < ApplicationController
  def query_station
    latlong = JSON.parse(Base64.urlsafe_decode64(params[:latlong]))
    render json: Station.closest_station(latlong['latitude'], latlong['longitude'])
  end

  def query_monthly_weather
    noaa_id_year = JSON.parse(Base64.urlsafe_decode64(params[:noaa_id_year]))
    station = Station.find_by(noaa_id: noaa_id_year['noaa_id'])
    render json: station.get_monthly_weather(noaa_id_year['year'])
  end

  def query_daily_weather
    noaa_id_year_month = JSON.parse(Base64.urlsafe_decode64(params[:noaa_id_year_month]))
    station = Station.find_by(noaa_id: noaa_id_year_month['noaa_id'])
    render json: station.get_daily_weather(noaa_id_year_month['year'].to_i, noaa_id_year_month['month'].to_i)
  end
end
