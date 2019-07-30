Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  get "/weather/:noaa_id_year", to: "stations#query_weather"
  get "/stations/:latlong", to: "stations#query_station"
end
