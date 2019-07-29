class StationsController < ApplicationController
  def query
    latlong = JSON.parse(Base64.urlsafe_decode64(params[:latlong]))
    render json: Station.closest_station(latlong["latitude"], latlong["longitude"])
  end
end
