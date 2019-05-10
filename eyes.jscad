// title      : robot eyes
// author     : Udi Finkelstein
// license    : MIT License
// revision   : 0.1

function main() {
	return union(
		difference(
			union(
				cylinder({r:20, h:25}),
				cylinder({r:25, h:2})
			),
			cylinder({r:15, h:25})
		),
		cylinder({r:30, h:0.3})
	);
}
