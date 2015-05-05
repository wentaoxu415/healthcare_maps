import json
import copy

out_file = open("../data/state_counties.json", "w")

county_array = dict()
with open("../data/StateCounties.json") as data_file:
	data = json.load(data_file)
	county_array = copy.deepcopy(data)
	for outerkey, outervalue in data.iteritems():
		for innerkey, innervalue in data[outerkey].iteritems():
			county_name = innerkey.lower()
			county_name = county_name.replace("county", "")
			county_name = county_name.replace(" ", "")
			county_array[outerkey][county_name] = county_array[outerkey][innerkey] 
			del county_array[outerkey][innerkey] 

json.dump(county_array, out_file, indent=4)