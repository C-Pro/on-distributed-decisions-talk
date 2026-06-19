Real-time bidding (RTB) and social network feed systems require ultra-low latency and high availability.

To achieve millisecond response times, active data (like profiles or budgets) is kept in-memory (using Redis or Memcached), and computations are pushed to edge nodes. 

However, because users need to retrieve data from multiple shards to assemble a single view, a single shard failure can impact the entire user experience. We use asynchronous replication to sync budgets and apply graceful degradation (e.g., prioritizing premium clients or disabling non-critical features) to handle peak loads and failures.
