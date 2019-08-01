Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  get "/weather/monthly/:noaa_id_year", to: "stations#query_monthly_weather"
  get "/weather/daily/:noaa_id_year_month", to: "stations#query_daily_weather"

  get "/stations/:latlong", to: "stations#query_station"
end
