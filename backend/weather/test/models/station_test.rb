require 'test_helper'

class StationTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  Rake::Task["db:seed"].invoke # seed after starting
  test 'right number of months' do
    assert Station.first.build_base_monthly_hash.length == 12
  end

  test 'opposite point on equator has a haversine distance of PI, thanks evan for math brainz' do
    assert Station.haversine_distance(0,0, 0, 180) == Math::PI
  end

  test 'half-opposite point has a haversine distance of PI/2' do
    # We need to do prev_float because this sucks
    assert Station.haversine_distance(0,0, 0, 90) == (Math::PI/2).prev_float

    # other variations
    assert Station.haversine_distance(0,0, 90, 90) == (Math::PI/2).prev_float
    assert Station.haversine_distance(0,0, -90, -90) == (Math::PI/2).prev_float
    assert Station.haversine_distance(0,0, 90, 180) == (Math::PI/2).prev_float

    # same point
    assert Station.haversine_distance(0,0, 180, 180) == 0.0
    assert Station.haversine_distance(0,0, -180, -180) == 0.0
  end

  test 'Station::get_monthly_weather(year) returns reasonable data' do
    assert Station.count > 0, 'Please seed the database.'
    result = Station.first.get_monthly_weather(1950)
    assert result.has_key?('meta')
    assert result['meta'].has_key?('year')
    assert result['meta']['year'] > 0

    # 81 years of forward compatibility
    assert result['meta']['year'] < 2100

    assert result['meta'].has_key?('noaa_id')
    assert !(result['meta']['noaa_id'].empty?)

    assert result['meta'].has_key?('city')
    assert !(result['meta']['city'].empty?)

    assert result['meta'].has_key?('state')
    assert !(result['meta']['state'].empty?)

    assert result.has_key?('results')
    assert result['results'].length == 12
    
    assert result['results'] != nil

    result['results'].each do |single_result|
      assert single_result.has_key?(:month)
      assert !(single_result[:month].empty?)

      assert single_result.has_key?('mean_temp')
      # absolute zero is minus 459.67 degrees Fahrenheit
      assert single_result['mean_temp'] > -460

      # ~melting point of lead is 621.4°F
      assert single_result['mean_temp'] < 621

      assert single_result.has_key?('total_precip')
      assert single_result['total_precip'] > -0.1

      assert single_result.has_key?('total_snow')
      assert single_result['total_snow'] > -0.1
    end

  end

  test 'Station::get_daily_weather(year, month) returns reasonable data' do
    result = Station.first.get_daily_weather(1950, 1)
    assert result.has_key?('meta')

    assert result['meta'].has_key?('year')
    assert result['meta']['year'] > 0

    # 81 years of forward compatibility
    assert result['meta']['year'] < 2100

    assert result['meta'].has_key?('month')
    assert result['meta']['month'] >= 0
    assert result['meta']['month'] <= 12

    assert result['meta'].has_key?('noaa_id')
    assert !(result['meta']['noaa_id'].empty?)

    assert result['meta'].has_key?('city')
    assert !(result['meta']['city'].empty?)

    assert result['meta'].has_key?('state')
    assert !(result['meta']['state'].empty?)

    assert result.has_key?('results')
    
    assert result['results'] != nil
    assert result['results'].length > 27

    result['results'].each do |single_result|
      assert single_result.has_key?(:day)

      assert single_result.has_key?('max_temp')
      # absolute zero is minus 459.67 degrees Fahrenheit
      assert single_result['max_temp'] > -460

      # ~melting point of lead is 621.4°F
      assert single_result['max_temp'] < 621

      assert single_result.has_key?('min_temp')
      # absolute zero is minus 459.67 degrees Fahrenheit
      assert single_result['min_temp'] > -460

      # ~melting point of lead is 621.4°F
      assert single_result['min_temp'] < 621

    end

  end
end
