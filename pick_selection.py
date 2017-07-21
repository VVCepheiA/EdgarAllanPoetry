import random
import os

def pick(rel_path="human.txt"):
	script_path = os.path.abspath(__file__)
	script_dir = os.path.split(script_path)[0]
	abs_file_path = os.path.join(script_dir, rel_path)

	txt = open(abs_file_path)
	lines = txt.readlines()
	start = random.randrange(0,len(lines))
	start -= start % 4

	print("".join(lines[start:(start+4)]))
