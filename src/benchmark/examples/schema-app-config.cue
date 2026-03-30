// Schema definitions
#DatabaseConfig: {
	host: string
	port: int & >=1 & <=65535
	name: string
	pool: {
		min:         int & >=1
		max:         int & >=1
		idleTimeout: int & >=0
	}
	ssl: bool
	replicas: [...{
		host:     string
		port:     int & >=1 & <=65535
		priority: int & >=0 & <=100
	}]
}

#CacheConfig: {
	provider:       "redis" | "memcached" | "in-memory"
	host:           string
	port:           int & >=1 & <=65535
	ttl:            int & >=0
	maxMemory:      string
	evictionPolicy: "lru" | "lfu" | "random" | "ttl"
}

#ServiceEndpoint: {
	url:     string
	timeout: int & >=100
	retries: int & >=0 & <=10
	circuitBreaker: {
		enabled:      bool
		threshold:    int & >=1
		resetTimeout: int & >=1000
	}
}

#LogConfig: {
	level:  "debug" | "info" | "warn" | "error"
	format: "json" | "text" | "structured"
	outputs: [...{
		type:   "stdout" | "file" | "syslog" | "cloudwatch"
		config: {...}
	}]
}

#AppConfig: {
	environment: "development" | "staging" | "production"
	version:     string
	server: {
		host: string
		port: int & >=1 & <=65535
		cors: {
			origins: [...string]
			methods: [...string]
			maxAge: int & >=0
		}
	}
	database: #DatabaseConfig
	cache:    #CacheConfig
	services: [string]: #ServiceEndpoint
	logging: #LogConfig
	features: [string]: bool
}

// Actual config data
config: #AppConfig & {
	environment: "production"
	version:     "2.14.3"
	server: {
		host: "0.0.0.0"
		port: 8443
		cors: {
			origins: ["https://app.acme.com", "https://admin.acme.com", "https://api.acme.com"]
			methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
			maxAge: 86400
		}
	}
	database: {
		host: "db-primary.internal"
		port: 5432
		name: "acme_prod"
		pool: {
			min:         10
			max:         100
			idleTimeout: 30000
		}
		ssl: true
		replicas: [{
			host:     "db-replica-1.internal"
			port:     5432
			priority: 100
		}, {
			host:     "db-replica-2.internal"
			port:     5432
			priority: 80
		}, {
			host:     "db-replica-3.internal"
			port:     5432
			priority: 60
		}]
	}
	cache: {
		provider:       "redis"
		host:           "cache.internal"
		port:           6379
		ttl:            3600
		maxMemory:      "2gb"
		evictionPolicy: "lru"
	}
	services: {
		auth: {
			url:     "https://auth.internal:8443"
			timeout: 5000
			retries: 3
			circuitBreaker: {
				enabled:      true
				threshold:    5
				resetTimeout: 30000
			}
		}
		payments: {
			url:     "https://payments.internal:8443"
			timeout: 10000
			retries: 2
			circuitBreaker: {
				enabled:      true
				threshold:    3
				resetTimeout: 60000
			}
		}
		notifications: {
			url:     "https://notify.internal:8443"
			timeout: 3000
			retries: 5
			circuitBreaker: {
				enabled:      false
				threshold:    10
				resetTimeout: 15000
			}
		}
		search: {
			url:     "https://search.internal:9200"
			timeout: 8000
			retries: 2
			circuitBreaker: {
				enabled:      true
				threshold:    5
				resetTimeout: 45000
			}
		}
		storage: {
			url:     "https://s3.us-west-2.amazonaws.com"
			timeout: 15000
			retries: 3
			circuitBreaker: {
				enabled:      false
				threshold:    10
				resetTimeout: 30000
			}
		}
	}
	logging: {
		level:  "info"
		format: "json"
		outputs: [{
			type:   "stdout"
			config: {}
		}, {
			type: "cloudwatch"
			config: {
				region:        "us-west-2"
				logGroup:      "/acme/api/production"
				retentionDays: 90
			}
		}, {
			type: "file"
			config: {
				path:     "/var/log/acme/api.log"
				maxSize:  "100mb"
				maxFiles: 10
				compress: true
			}
		}]
	}
	features: {
		darkMode:          true
		betaSearch:        false
		newCheckout:       true
		aiAssistant:       true
		multiLanguage:     false
		advancedReporting: true
		webhooks:          true
		customBranding:    false
	}
}
