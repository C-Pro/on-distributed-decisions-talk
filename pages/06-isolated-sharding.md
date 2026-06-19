For analytics and monitoring systems, the top priority is write availability and scaling to handle massive event streams.

We ingest data via load balancers, buffer it in distributed brokers (like Kafka, Redpanda, Nats), and route it to independent shards. 

Because the shards are isolated (partitioned by user or application), a single shard failure only affects a subset of users. The rest of the system remains fully operational. Strict consistency is sacrificed in favor of eventual consistency to maintain maximum availability.
