import json
import copy
from collections import OrderedDict

spending_array = OrderedDict()
spending_output = open("../data/hospital_spendingData.json", "w")
with open("../data/hospital_spending_final.json") as spending_file:
	spending = json.load(spending_file)

	for key1, val1 in spending.iteritems():
		try:
			name = spending[key1]["name"]
			amount = spending[key1]["spending"]
			spending_array[name] = 
		except KeyError:
			continue


	json.dump(spending_array, spending_output, indent=4)