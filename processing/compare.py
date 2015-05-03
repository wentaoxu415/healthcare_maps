import json

with open("../data/demographics.json") as demographic_file:
	demo = json.load(demographic_file)
	ctr = 0
	for key, value in demo.iteritems():
		ctr +=1
	print ctr
with open("../data/state_counties.json") as county_file:
	county = json.load(county_file)
	counter = 0
	for outkey, outvalue in county.iteritems():
		for inkey, invalue in county[outkey].iteritems():
			if inkey in demo:
				counter +=1
				

	print counter

	



