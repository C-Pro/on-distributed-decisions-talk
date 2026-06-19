There are myriads of concepts computer scientists and distributed system practitioners have come up with to confuse the unsuspecting engineer.
Let's quickly skim through some of them so we can all pretend to know what we are doing:

* Cluster - A collection of nodes that constitute your system.
* Consensus - A state of the cluster when nodes agree on something important (like the color of the bike shed).
* Sharding - Strategic distribution of data among nodes to utilize resources of multiple machines. A core instrument for horizontal scalability.
* Caching - Storing frequently accessed data in memory to reduce latency. Mostly used for read operations.
* Raft - A popular consensus algorithm that allows a distributed system to maintain a consistent shared state in an unreliable and cruel world full of T-Rexes.
* ACID - A set of properties (atomicity, consistency, isolation, and durability) that many popular databases provide, giving developers some peace of mind regarding the consistency of their data.
* Leader election - The process of determining which node is the authoritative source of truth for some subset of the data. It is part of some consensus algorithms like Raft or Paxos.
* Conflict resolution - In leaderless or temporary split-brain scenarios, nodes can have conflicting states for some piece of data. Conflict resolution rules are meant to provide a way to converge to a single unambiguous state. One of the simplest and most popular rules is "last write wins."
* Transactions - An approach to bundle multiple mutations of the system state into a single atomic operation that either succeeds in full or is not applied at all. This helps to maintain consistency.
* Eventual consistency - An approach where the system is guaranteed to eventually reach a consistent state if write operations stop.
* Idempotency - A property where the same action always yields the same result no matter how many times it is repeated. Having idempotency in a distributed system makes it easier to reach consistency after a failure via simple retries.
