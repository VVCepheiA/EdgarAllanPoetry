import random

txt = open('./rnn.txt')
lines = txt.readlines()
start = random.randrange(0,len(lines))
start -= start % 4

print("".join(lines[start:(start+4)]))
