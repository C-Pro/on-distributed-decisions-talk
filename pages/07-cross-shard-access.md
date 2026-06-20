Real-time bidding (RTB) and social network feed systems have highly connected data that is impossible to split to completely non-overlapping shards.

Because users need to retrieve data from multiple shards to assemble a single view, a single shard failure can impact the entire user experience. We use asynchronous replication to sync budgets and apply graceful degradation (e.g., prioritizing premium clients or disabling non-critical features) to handle peak loads and failures.
