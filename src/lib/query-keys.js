/**
 * Centralized query keys for TanStack Query.
 * Invalidate these after mutations so lists refetch automatically.
 */
export const queryKeys = {
	tickets: {
		all: ['tickets'],
		myTickets: ['tickets', 'my-tickets'],
		organizerTickets: (eventId) => ['tickets', 'organizer', eventId],
		adminAll: (filters) => ['tickets', 'admin', filters]
	},
	events: {
		all: ['events'],
		list: ['events', 'list'],
		detail: (id) => ['events', 'detail', id],
		adminAll: ['events', 'admin'],
		organizerAll: ['events', 'organizer']
	},
	student: {
		profile: ['student', 'profile'],
		dashboard: ['student', 'dashboard']
	},
	admin: {
		paymentForms: (filters) => ['admin', 'payment-forms', filters],
		payoutRequests: (filters) => ['admin', 'payout-requests', filters],
		withdrawals: (filters) => ['admin', 'withdrawals', filters],
		users: (filters) => ['admin', 'users', filters],
		organizations: ['admin', 'organizations'],
		auditLogs: (filters) => ['admin', 'audit-logs', filters],
		revenue: ['admin', 'revenue'],
		dashboard: ['admin', 'dashboard'],
		analytics: ['admin', 'analytics']
	},
	organizer: {
		profile: ['organizer', 'profile'],
		events: ['organizer', 'events'],
		wallet: ['organizer', 'wallet'],
		dashboard: ['organizer', 'dashboard'],
		eventDetail: (eventId) => ['organizer', 'event', eventId],
		analytics: (eventId) => ['organizer', 'analytics', eventId],
		eventTickets: (eventId) => ['organizer', 'event', eventId, 'tickets'],
		eventCategories: (eventId) => ['organizer', 'event', eventId, 'categories'],
		banks: ['organizer', 'banks'],
		bankAccount: ['organizer', 'bank-account'],
		config: ['organizer', 'config']
	}
}
