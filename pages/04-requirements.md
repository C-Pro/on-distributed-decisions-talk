Let's try to think about what the most important requirements are that will affect your architectural decisions when designing a distributed system.

Sure, the first thing is to come up with the name. Then the color of the bike shed. And whether you will use tabs or spaces.

Once done with the important stuff, we have some technical details to iron out:

Availability - What is our SLA? How important to our business is it to be online more often than not? Availability comes at a cost, and for many use cases, it may be more efficient to tolerate minor downtime (e.g., during deployments) than to pay for redundancy and support a complicated infrastructure spanning multiple data centers and/or cloud providers. For other businesses, it may be super important to be online as close to 100% of the time as possible.

Consistency - This is the other side of the CAP dilemma, the twin brother of availability that hates its sibling's guts. Consider a chat application where individual chat messages are replicated between nodes, but only one of the nodes is the source of truth for any given chat. When one of the nodes goes down or becomes disconnected, the chats it hosted can become read-only, but other chats will be just fine. We are compromising consistency but gaining availability. A bank, on the other hand, would not do well by compromising consistency, so this use case mandates compromising availability.

Throughput - The throughput requirement is basically how much of something happening in a unit of time your system can handle. And read throughput is a completely different beast from write throughput. Usually, throughput is closely related to scalability and your consistency requirements: it is usually much easier to achieve high throughput numbers when eventual consistency is an option.

Latency - Latency is important for many financial or real-time applications: trading, real-time billing, RTB advertisements, multiplayer games, etc. Latency is at odds with both consistency (think synchronous replication) and throughput (think batching).

Scalability - Scalability is the ability of the system to adapt to a very wide range of throughput numbers. For example, today your distributed chat application has 2 users, but tomorrow it is trending on Hacker News and you add 10k users per day.
