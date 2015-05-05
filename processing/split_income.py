import json
import copy
from collections import OrderedDict

income_array = OrderedDict()
income_output = open("../data/county_income.json", "w")
income_bracket = ["$1 under $10,000", "$10,000 under $25,000", "$25,000 under $50,000", "$50,000 under $75,000", \
"$75,000 under $100,000", "$100,000 under $200,000", "$200,000 or more"]

with open("../data/state_counties.json") as income_file:
	income = json.load(income_file)

	for key1, val1 in income.iteritems():
		for key2, val2 in income[key1].iteritems():
			income_array[key2] = OrderedDict()
			if val2 != None and len(val2) == 7:
				ctr = 0
				for val in val2:
					bracket = income_bracket[ctr]
					income_array[key2][bracket] = val
					ctr+=1
		
	json.dump(income_array, income_output, indent=4)
