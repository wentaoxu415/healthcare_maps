import json
from pprint import pprint
import geojson
from geojson import FeatureCollection, Feature, Point

out_file = open("hospital.json", "w")
feat_collect = []
with open("hospital_spending.json") as data_file:
	data = json.load(data_file)
	for key, value in data.iteritems():
		if len(value) > 1: #Make sure we have more than spending data
			if (value["longitude"] and value["longitude"]) != None:
				#print value["longitude"], value["latitude"]
				feat = Feature(geometry=Point((value["longitude"], value["latitude"])), 
					properties={
					"name":value["name"], 
					"address":value["address"], 
					"city":value["city"], 
					"state": value["state"], 
					"zip": value["zip"], 
					"county": value["county"], 
					"owner": value["owner"]
					})
				feat_collect.append(feat)

	results = FeatureCollection(feat_collect)
	#rint type(results)
	#pprint(results)
	geojson.dump(results, out_file, sort_keys=True)
	# example = Feature(geometry=Point((10, 20)))
	# exam = geojson.dumps(example, sort_keys=True)
	# pprint(results)
	