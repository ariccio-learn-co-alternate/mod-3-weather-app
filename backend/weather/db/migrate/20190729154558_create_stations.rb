class CreateStations < ActiveRecord::Migration[5.2]
  def change
    create_table :stations do |t|
      t.string :noaa_id
      t.string :city
      t.string :state
      t.float :latitude, precision: 10, scale: 6
      t.float :longitude, precision: 10, scale: 6

      t.timestamps
    end
  end
end
