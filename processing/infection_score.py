import json
import csv 

infection_score = dict()

in_file = "../data/infection_hospital.csv"
out_file = open("../data/infection_score.json", "w")

with open(in_file, 'rU') as infection_fh:
	infection_csv = csv.reader(infection_fh, delimiter=',', quotechar='"')
	next(infection_csv, None)

	for row in infection_csv:
		if row[1] not in infection_score:
			infection_score[row[1]] = 0 
		if row[10] == "Better than the U.S. National Benchmark":
			infection_score[row[1]] += 1
		elif row[10] == "Worse than the U.S. National Benchmark":
			infection_score[row[1]] -= 1

	json.dump(infection_score, out_file, indent=4)