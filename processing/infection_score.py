import json
import csv 

score = dict()

infection_file = "../data/infection_hospital.csv"
complication_file = "../data/complication.csv"
out_file = open("../data/quality_score.json", "w")

with open(infection_file, 'rU') as infection_fh:
	infection_csv = csv.reader(infection_fh, delimiter=',', quotechar='"')
	next(infection_csv, None)

	for row in infection_csv:
		if row[1] not in score:
			score[row[1]] = 0 
		if row[10] == "Better than the U.S. National Benchmark":
			score[row[1]] += 1
			print "infect_good", score[row[1]]
		elif row[10] == "Worse than the U.S. National Benchmark":
			score[row[1]] -= 1
			print "infect_bad", score[row[1]]

with open(complication_file, 'rU') as complication_fh:
	complication_csv = csv.reader(complication_fh, delimiter=",", quotechar='"')
	next(complication_csv, None)

	for row in complication_csv:
		if row[10] == "Better than the U.S. National Benchmark":
			score[row[1]] += 1
			print "complicate_good", score[row[1]]
		elif row[10] == "Worse than the U.S. National Benchmark":
			score[row[1]] -= 1
			print "complicate_bad", score[row[1]]

json.dump(score, out_file, indent=4)