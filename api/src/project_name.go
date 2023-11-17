package src

import (
	"math/rand"
)

func ProjectName() string {
	adjectives := []string{
		"Agile", "Robust", "Dynamic", "Intuitive", "Scalable", "Secure",
		"Efficient", "Flexible", "Reliable", "Innovative", "Friendly", "Responsive",
		"Fast", "Powerful", "Customizable", "Integrated", "Automated", "Modular",
		"Sophisticated", "Streamlined", "Versatile", "Collaborative", "Advanced",
		"Elegant", "Precise", "Optimized", "Functional", "Accessible", "Sustainable",
		"Intelligent", "Strategic", "Proactive", "Seamless", "Integrated", "Holistic",
		"Adaptive", "Immersive", "Convergent", "Predictive", "Transparent", "Immersive",
	}

	features := []string{
		"Authentication", "Dashboard", "Analytics", "Scheduler", "Notification", "Reporting",
		"Search", "Workflow", "Dataprocessing", "Monitoring", "Backup", "Messaging",
		"Interface", "Integration", "Configuration", "Optimization", "Synchronization",
		"Encryption", "Localization", "Caching", "Logging", "Debugging", "Deployment",
		"Validation", "Authorization", "Customization", "Documentation", "Navigation",
		"Queueing", "Benchmarking", "Compression", "Decompression", "Transcoding",
		"Archiving", "Rendering", "Parsing", "Indexing", "Streaming", "Batching",
		"Crawling", "Filtering", "Tagging", "Exporting", "Importing", "Scheduling",
		"Mapping", "Tracking", "Encoding", "Decoding", "Synthesizing", "Orchestrating",
		"Harvesting", "Clustering", "Replicating", "Aggregating", "Virtualizing",
	}

	adj := adjectives[rand.Intn(len(adjectives))]
	feature := features[rand.Intn(len(features))]
	return adj + " " + feature
}
