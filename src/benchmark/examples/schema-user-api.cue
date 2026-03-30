// Schema definitions
#Address: {
	street:  string
	city:    string
	state:   string & =~"^[A-Z]{2}$"
	zip:     string & =~"^[0-9]{5}$"
	country: string
}

#Subscription: {
	plan:         "free" | "starter" | "pro" | "enterprise"
	status:       "active" | "canceled" | "past_due" | "trialing"
	billingCycle: "monthly" | "annual"
	renewsAt:     string
	seats:        int & >=1
	features: [...string]
}

#User: {
	id:          string
	email:       string & =~"^[^@]+@[^@]+$"
	displayName: string
	role:        "admin" | "editor" | "viewer" | "owner"
	verified:    bool
	createdAt:   string
	lastLoginAt: string
	address:     #Address
	subscription: #Subscription
	preferences: {
		theme:    "light" | "dark" | "system"
		language: string
		timezone: string
		notifications: {
			email: bool
			push:  bool
			sms:   bool
		}
	}
}

#TeamResponse: {
	teamId:    string
	teamName:  string
	plan:      "starter" | "pro" | "enterprise"
	members: [...#User]
	totalSeats: int & >=1
	usedSeats:  int & >=0
}

// Actual API response data
response: #TeamResponse & {
	teamId:     "team_8xK2mN"
	teamName:   "Acme Engineering"
	plan:       "enterprise"
	totalSeats: 50
	usedSeats:  12
	members: [{
		id:          "usr_001"
		email:       "alice@acme.com"
		displayName: "Alice Johnson"
		role:        "owner"
		verified:    true
		createdAt:   "2023-01-15T08:00:00Z"
		lastLoginAt: "2024-03-28T14:22:00Z"
		address: {
			street:  "100 Main St"
			city:    "Portland"
			state:   "OR"
			zip:     "97201"
			country: "US"
		}
		subscription: {
			plan:         "enterprise"
			status:       "active"
			billingCycle: "annual"
			renewsAt:     "2025-01-15T00:00:00Z"
			seats:        50
			features: ["sso", "audit-log", "advanced-analytics", "priority-support", "custom-domains"]
		}
		preferences: {
			theme:    "dark"
			language: "en"
			timezone: "America/Los_Angeles"
			notifications: {
				email: true
				push:  true
				sms:   false
			}
		}
	}, {
		id:          "usr_002"
		email:       "bob@acme.com"
		displayName: "Bob Martinez"
		role:        "admin"
		verified:    true
		createdAt:   "2023-02-10T10:30:00Z"
		lastLoginAt: "2024-03-27T09:15:00Z"
		address: {
			street:  "250 Oak Ave"
			city:    "San Francisco"
			state:   "CA"
			zip:     "94102"
			country: "US"
		}
		subscription: {
			plan:         "enterprise"
			status:       "active"
			billingCycle: "annual"
			renewsAt:     "2025-02-10T00:00:00Z"
			seats:        50
			features: ["sso", "audit-log", "advanced-analytics", "priority-support", "custom-domains"]
		}
		preferences: {
			theme:    "light"
			language: "en"
			timezone: "America/New_York"
			notifications: {
				email: true
				push:  false
				sms:   false
			}
		}
	}, {
		id:          "usr_003"
		email:       "carol@acme.com"
		displayName: "Carol Wu"
		role:        "editor"
		verified:    true
		createdAt:   "2023-03-05T14:00:00Z"
		lastLoginAt: "2024-03-28T11:45:00Z"
		address: {
			street:  "88 Pine Rd"
			city:    "Seattle"
			state:   "WA"
			zip:     "98101"
			country: "US"
		}
		subscription: {
			plan:         "pro"
			status:       "active"
			billingCycle: "monthly"
			renewsAt:     "2024-04-05T00:00:00Z"
			seats:        5
			features: ["advanced-analytics", "priority-support"]
		}
		preferences: {
			theme:    "system"
			language: "zh"
			timezone: "America/Los_Angeles"
			notifications: {
				email: true
				push:  true
				sms:   true
			}
		}
	}, {
		id:          "usr_004"
		email:       "dan@acme.com"
		displayName: "Dan O'Brien"
		role:        "editor"
		verified:    true
		createdAt:   "2023-04-12T09:00:00Z"
		lastLoginAt: "2024-03-26T16:30:00Z"
		address: {
			street:  "455 Elm St"
			city:    "Austin"
			state:   "TX"
			zip:     "78701"
			country: "US"
		}
		subscription: {
			plan:         "pro"
			status:       "active"
			billingCycle: "annual"
			renewsAt:     "2025-04-12T00:00:00Z"
			seats:        10
			features: ["advanced-analytics", "priority-support", "custom-domains"]
		}
		preferences: {
			theme:    "dark"
			language: "en"
			timezone: "America/Chicago"
			notifications: {
				email: false
				push:  true
				sms:   false
			}
		}
	}, {
		id:          "usr_005"
		email:       "eva@acme.com"
		displayName: "Eva Petrova"
		role:        "viewer"
		verified:    false
		createdAt:   "2023-05-20T11:15:00Z"
		lastLoginAt: "2024-03-25T08:00:00Z"
		address: {
			street:  "12 Birch Ln"
			city:    "Denver"
			state:   "CO"
			zip:     "80202"
			country: "US"
		}
		subscription: {
			plan:         "starter"
			status:       "trialing"
			billingCycle: "monthly"
			renewsAt:     "2024-04-20T00:00:00Z"
			seats:        1
			features: []
		}
		preferences: {
			theme:    "light"
			language: "ru"
			timezone: "America/Denver"
			notifications: {
				email: true
				push:  false
				sms:   false
			}
		}
	}, {
		id:          "usr_006"
		email:       "frank@acme.com"
		displayName: "Frank Nakamura"
		role:        "editor"
		verified:    true
		createdAt:   "2023-06-08T13:45:00Z"
		lastLoginAt: "2024-03-28T10:00:00Z"
		address: {
			street:  "900 Cedar Blvd"
			city:    "Chicago"
			state:   "IL"
			zip:     "60601"
			country: "US"
		}
		subscription: {
			plan:         "enterprise"
			status:       "active"
			billingCycle: "annual"
			renewsAt:     "2025-06-08T00:00:00Z"
			seats:        50
			features: ["sso", "audit-log", "advanced-analytics", "priority-support", "custom-domains"]
		}
		preferences: {
			theme:    "dark"
			language: "ja"
			timezone: "America/Chicago"
			notifications: {
				email: true
				push:  true
				sms:   false
			}
		}
	}, {
		id:          "usr_007"
		email:       "grace@acme.com"
		displayName: "Grace Kim"
		role:        "admin"
		verified:    true
		createdAt:   "2023-07-01T07:30:00Z"
		lastLoginAt: "2024-03-28T15:10:00Z"
		address: {
			street:  "321 Maple Dr"
			city:    "Boston"
			state:   "MA"
			zip:     "02101"
			country: "US"
		}
		subscription: {
			plan:         "enterprise"
			status:       "active"
			billingCycle: "annual"
			renewsAt:     "2025-07-01T00:00:00Z"
			seats:        50
			features: ["sso", "audit-log", "advanced-analytics", "priority-support", "custom-domains"]
		}
		preferences: {
			theme:    "system"
			language: "ko"
			timezone: "America/New_York"
			notifications: {
				email: true
				push:  true
				sms:   true
			}
		}
	}, {
		id:          "usr_008"
		email:       "hector@acme.com"
		displayName: "Hector Ramirez"
		role:        "viewer"
		verified:    true
		createdAt:   "2023-08-14T16:00:00Z"
		lastLoginAt: "2024-03-20T12:00:00Z"
		address: {
			street:  "567 Walnut St"
			city:    "Miami"
			state:   "FL"
			zip:     "33101"
			country: "US"
		}
		subscription: {
			plan:         "free"
			status:       "active"
			billingCycle: "monthly"
			renewsAt:     "2024-09-14T00:00:00Z"
			seats:        1
			features: []
		}
		preferences: {
			theme:    "light"
			language: "es"
			timezone: "America/New_York"
			notifications: {
				email: false
				push:  false
				sms:   false
			}
		}
	}, {
		id:          "usr_009"
		email:       "irene@acme.com"
		displayName: "Irene Okafor"
		role:        "editor"
		verified:    true
		createdAt:   "2023-09-22T10:00:00Z"
		lastLoginAt: "2024-03-27T17:45:00Z"
		address: {
			street:  "44 Spruce Way"
			city:    "Atlanta"
			state:   "GA"
			zip:     "30301"
			country: "US"
		}
		subscription: {
			plan:         "pro"
			status:       "past_due"
			billingCycle: "monthly"
			renewsAt:     "2024-03-22T00:00:00Z"
			seats:        3
			features: ["advanced-analytics"]
		}
		preferences: {
			theme:    "dark"
			language: "en"
			timezone: "America/New_York"
			notifications: {
				email: true
				push:  true
				sms:   false
			}
		}
	}, {
		id:          "usr_010"
		email:       "jake@acme.com"
		displayName: "Jake Thompson"
		role:        "viewer"
		verified:    false
		createdAt:   "2023-10-30T08:30:00Z"
		lastLoginAt: "2024-03-15T09:00:00Z"
		address: {
			street:  "789 Ash Ct"
			city:    "Phoenix"
			state:   "AZ"
			zip:     "85001"
			country: "US"
		}
		subscription: {
			plan:         "starter"
			status:       "canceled"
			billingCycle: "monthly"
			renewsAt:     "2024-02-28T00:00:00Z"
			seats:        1
			features: []
		}
		preferences: {
			theme:    "system"
			language: "en"
			timezone: "America/Phoenix"
			notifications: {
				email: false
				push:  true
				sms:   false
			}
		}
	}, {
		id:          "usr_011"
		email:       "kate@acme.com"
		displayName: "Kate Lindqvist"
		role:        "editor"
		verified:    true
		createdAt:   "2023-11-18T12:00:00Z"
		lastLoginAt: "2024-03-28T13:30:00Z"
		address: {
			street:  "22 Willow Park"
			city:    "Minneapolis"
			state:   "MN"
			zip:     "55401"
			country: "US"
		}
		subscription: {
			plan:         "pro"
			status:       "active"
			billingCycle: "annual"
			renewsAt:     "2025-11-18T00:00:00Z"
			seats:        5
			features: ["advanced-analytics", "priority-support"]
		}
		preferences: {
			theme:    "light"
			language: "sv"
			timezone: "America/Chicago"
			notifications: {
				email: true
				push:  false
				sms:   true
			}
		}
	}, {
		id:          "usr_012"
		email:       "leo@acme.com"
		displayName: "Leo Fernandez"
		role:        "viewer"
		verified:    true
		createdAt:   "2024-01-05T15:30:00Z"
		lastLoginAt: "2024-03-28T08:15:00Z"
		address: {
			street:  "156 Redwood Ave"
			city:    "San Diego"
			state:   "CA"
			zip:     "92101"
			country: "US"
		}
		subscription: {
			plan:         "starter"
			status:       "active"
			billingCycle: "monthly"
			renewsAt:     "2024-04-05T00:00:00Z"
			seats:        2
			features: []
		}
		preferences: {
			theme:    "dark"
			language: "pt"
			timezone: "America/Los_Angeles"
			notifications: {
				email: true
				push:  true
				sms:   false
			}
		}
	}]
}
