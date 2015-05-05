import json

with open("../data/hospital_spending_final.json") as spending_file:
	spending = json.load(spending_file)

	min_val = float("inf")
	max_val = float("-inf")
	for key, value in spending.iteritems():
		if spending[key]["spending"] < min_val:
			min_val = spending[key]["spending"]
		if spending[key]["spending"] > max_val:
			max_val = spending[key]["spending"]
			max_place = spending[key]["name"]
	print min_val, max_val, max_place