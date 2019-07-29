# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
require "dotenv"
require "rest-client"
require "json"

Dotenv.load("api_key.env")
api_key = ENV["API_KEY"]

Station.destroy_all

resp = RestClient::Request.execute(url: "https://www.ncdc.noaa.gov/cdo-web/api/v2/stations/?locationid=FIPS:US&enddate=1950-01-01&startdate=2000-01-01&datasetid=GHCNDMS&datatypeid=TPCP&datatypeid=TSNW&datatypeid=MNTM&limit=500", method: "GET", headers: { token: api_key })

JSON.parse(resp)["results"].each do |station|
  unparsed_name = station["name"]
  city = unparsed_name.split(",")[0].titleize
  state = unparsed_name.split(",")[1].split[0]

  Station.create(
    noaa_id: station["id"],
    latitude: station["latitude"],
    longitude: station["longitude"],
    city: city,
    state: state,
  )
end
